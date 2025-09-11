/**
 * CommunityAnalytics tracks and analyzes community engagement and user activity.
 */

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, limit as fbLimit, Timestamp } from "firebase/firestore";

// Firestore collection name
const ANALYTICS_COLLECTION = "community_analytics";



/**
 * Log a user's action 
 *
 * Each call creates a new document with:
 * userId
 * actionType
 * metadata 
 * createdAt timestamp
 */
export async function logUserAction(
  userId: string,
  actionType: string,
  metadata: Record<string, any> = {}
) {
  if (!userId) throw new Error("userId is required.");
  if (!actionType) throw new Error("actionType is required.");

  const ref = collection(db, ANALYTICS_COLLECTION);
  await addDoc(ref, {
    userId,
    actionType,
    metadata,
    createdAt: Timestamp.now(),
  });
}

/**
 * Fetch recent activity of a user.
 * Returns up to limit most recent actions, ordered by date descending.
 */
export async function getUserActivity(userId: string, limit = 10) {
  if (!userId) throw new Error("userId is required.");

  const q = query(
    collection(db, ANALYTICS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    fbLimit(limit)
  );

  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  }));
}


/**
 * Engagement Metrics
 * Count community engagement by action type within the last days.
 */
export async function getCommunityEngagement(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const q = query(
    collection(db, ANALYTICS_COLLECTION),
    where("createdAt", ">=", Timestamp.fromDate(since))
  );

  const snap = await getDocs(q);
  const actions: Record<string, number> = {};

  snap.forEach((doc) => {
    const { actionType } = doc.data();
    actions[actionType] = (actions[actionType] || 0) + 1;
  });

  return actions;
}

/**
 * Calculate success rate for a given action type.
 * Looks for a boolean field in metadata example:  default: "success".
 */
export async function getSuccessRate(
  actionType: string,
  successKey: string = "success"
) {
  const q = query(
    collection(db, ANALYTICS_COLLECTION),
    where("actionType", "==", actionType)
  );

  const snap = await getDocs(q);
  let total = 0;
  let success = 0;

  snap.forEach((doc) => {
    total++;
    const data = doc.data();
    if (data.metadata?.[successKey]) {
      success++;
    }
  });

  return {
    total,
    success,
    rate: total > 0 ? success / total : 0,
  };
}


/**
 * Streak Tracking
 * Get the number of consecutive days a user has been active.
 *
 * Rules:
 * If user acted today, streak includes today.
 * If user skipped a day, streak ends.
 *
 */
export async function getUserStreak(userId: string) {
  if (!userId) throw new Error("userId is required.");

  // Get up to 30 days of recent activity 
  const q = query(
    collection(db, ANALYTICS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    fbLimit(30)
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    return { streak: 0, lastActive: null };
  }

  // Convert activity timestamps 
  const activityDates = snap.docs.map((doc) =>
    doc.data().createdAt.toDate().toISOString().split("T")[0]
  );
  const uniqueDates = Array.from(new Set(activityDates));

  // Sort dates descending (latest first)
  uniqueDates.sort((a, b) => (a > b ? -1 : 1));

  // Start streak calculation
  let streak = 1;
  let lastActive = new Date(uniqueDates[0]);
  let prev = lastActive;

  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i]);

    // Calculate day difference between consecutive dates
    const diffDays = Math.floor(
      (prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day = streak continues
      streak++;
      prev = current;
    } else {
      // Gap found = streak ends
      break;
    }
  }

  return { 
    streak, lastActive 
  };
}


