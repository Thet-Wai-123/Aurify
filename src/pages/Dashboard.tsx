import * as React from "react";
import Loader from "@/components/ui/Loader.tsx";

type Session = { id: string; startedAt: string; durationMin: number; topic: string; score?: number };
type DashboardData = { totalSessions: number; avgScore?: number; streakDays?: number; recent: Session[] };

// --- mock data so the page works out of the box ---
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function fetchDashboard(): Promise<DashboardData> {
  await wait(600); // simulate loading so the Loader is visible
  const recent: Session[] = [
    { id: "s_101", startedAt: new Date().toISOString(), durationMin: 12, topic: "Pronunciation", score: 88 },
    { id: "s_100", startedAt: new Date(Date.now()-864e5).toISOString(), durationMin: 9, topic: "Vocabulary", score: 76 },
    { id: "s_099", startedAt: new Date(Date.now()-2*864e5).toISOString(), durationMin: 15, topic: "Fluency", score: 90 },
  ];
  return { totalSessions: 37, avgScore: 84, streakDays: 5, recent };
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetchDashboard()
      .then(d => alive && setData(d))
      .catch(e => alive && setError(e?.message ?? "Failed to load dashboard"));
    return () => { alive = false; };
  }, []);

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!data) return <Loader label="Loading dashboard…" fullscreen overlay />;

  return (
    <div className="p-4 space-y-6">
      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total Sessions" value={data.totalSessions} />
        <Stat label="Avg. Score" value={`${data.avgScore ?? "-"}%`} />
        <Stat label="Streak" value={`${data.streakDays ?? 0} days`} />
      </section>

      {/* Recent Sessions */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Sessions</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-muted/40">
              <tr><Th>Started</Th><Th>Topic</Th><Th>Duration</Th><Th>Score</Th></tr>
            </thead>
            <tbody>
              {data.recent.map(s => (
                <tr key={s.id} className="border-t">
                  <Td>{new Date(s.startedAt).toLocaleString()}</Td>
                  <Td>{s.topic}</Td>
                  <Td>{s.durationMin} min</Td>
                  <Td>{s.score ?? "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick links */}
      <section className="flex flex-wrap gap-2">
        <a className="px-3 py-2 rounded-lg border" href="/practice">Start Practice</a>
        <a className="px-3 py-2 rounded-lg border bg-muted/40" href="/history">Open History</a>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg border">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
const Th: React.FC<React.PropsWithChildren> = ({ children }) => <th className="text-left p-2 font-semibold">{children}</th>;
const Td: React.FC<React.PropsWithChildren> = ({ children }) => <td className="p-2">{children}</td>;
