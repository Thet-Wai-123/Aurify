// src/lib/data/sessions.ts
export type Session = {
    id: string;
    startedAt: string;   // ISO
    durationMin: number;
    topic: string;
    score?: number;      // 0-100
  };
  
  export type DashboardData = {
    totalSessions: number;
    avgScore?: number;
    streakDays?: number;
    recent: Session[];
  };
  
  // ---- public API ----
  export async function getDashboardData(): Promise<DashboardData> {
    // Try Supabase → Firebase → Mock
    try { return await getFromSupabase(); } catch {}
    try { return await getFromFirebase(); } catch {}
    return getFromMock();
  }
  
  export async function getSessions(limitCount = 50): Promise<Session[]> {
    try { return await fetchSupabaseSessions(limitCount); } catch {}
    try { return await fetchFirebaseSessions(limitCount); } catch {}
    return mockSessions().slice(0, limitCount);
  }
  
  // ---- adapters ----
  async function getFromSupabase(): Promise<DashboardData> {
    const sessions = await fetchSupabaseSessions(50);
    return summarize(sessions);
  }
  async function getFromFirebase(): Promise<DashboardData> {
    const sessions = await fetchFirebaseSessions(50);
    return summarize(sessions);
  }
  
  // ---- Supabase ----
  async function fetchSupabaseSessions(limitCount: number): Promise<Session[]> {
    const { supabase } = await import("@/lib/supabase");
    // If Supabase not configured, the module exports a stub that throws when used.
    const { data, error } = await supabase
      .from("sessions")
      .select("id, user_id, started_at, duration_min, topic, score")
      .order("started_at", { ascending: false })
      .limit(limitCount);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id ?? crypto.randomUUID(),
      startedAt: r.started_at ?? new Date().toISOString(),
      durationMin: r.duration_min ?? 0,
      topic: r.topic ?? "Unknown",
      score: r.score ?? undefined,
    }));
  }
  
  // ---- Firebase (Firestore) ----
  async function fetchFirebaseSessions(limitCount: number): Promise<Session[]> {
    const { db, auth } = await import("@/lib/firebase");
    const {
      collection, collectionGroup, getDocs, query, where, orderBy, limit,
    } = await import("firebase/firestore");
  
    const uid = auth?.currentUser?.uid ?? null;
  
    // Try subcollection pattern: sessions/{uid}/items/*
    if (uid) {
      const subCol = collection(db, "sessions", uid, "items");
      const q1 = query(subCol, orderBy("startedAt", "desc"), limit(limitCount));
      const s1 = await getDocs(q1);
      const list1 = s1.docs.map(d => mapFirestore(d.id, d.data()));
      if (list1.length) return list1;
    }
  
    // Fallback: top-level "sessions" with optional userId
    const topCol = collection(db, "sessions");
    const base = uid
      ? query(topCol, where("userId", "==", uid), orderBy("startedAt", "desc"), limit(limitCount))
      : query(topCol, orderBy("startedAt", "desc"), limit(limitCount));
  
    const snap = await getDocs(base);
    return snap.docs.map(d => mapFirestore(d.id, d.data()));
  }
  
  function mapFirestore(id: string, r: any): Session {
    return {
      id,
      startedAt: r?.startedAt ?? r?.started_at ?? new Date().toISOString(),
      durationMin: r?.durationMin ?? r?.duration_min ?? 0,
      topic: r?.topic ?? "Unknown",
      score: r?.score ?? undefined,
    };
  }
  
  // ---- mock + helpers ----
  function mockSessions(): Session[] {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: `mock_${i}`,
      startedAt: new Date(Date.now() - i * 36e5).toISOString(),
      durationMin: 5 + (i % 12),
      topic: ["Pronunciation", "Vocabulary", "Fluency"][i % 3],
      score: 70 + (i * 3) % 30,
    }));
  }
  function getFromMock(): DashboardData {
    return summarize(mockSessions());
  }
  function summarize(sessions: Session[]): DashboardData {
    const totalSessions = sessions.length;
    const scored = sessions.filter(s => typeof s.score === "number") as Array<Session & { score: number }>;
    const avgScore = scored.length ? Math.round(scored.reduce((a, s) => a + s.score!, 0) / scored.length) : undefined;
    const streakDays = computeStreakByDay(sessions);
    const recent = sessions.slice(0, 3);
    return { totalSessions, avgScore, streakDays, recent };
  }
  function computeStreakByDay(sessions: Session[]): number {
    const dates = new Set(sessions.map(s => new Date(s.startedAt).toDateString()));
    let streak = 0;
    const d = new Date();
    while (dates.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
    return streak;
  }
  