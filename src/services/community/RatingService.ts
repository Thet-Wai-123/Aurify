/**
 * 
 * RatingService handles mutual rating system for practice sessions and maintain user reputation scores.
 * It allows users to rate other users and maintains a reputation summary
 *
 */


import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, increment, serverTimestamp,setDoc, FirestoreError, query, where } from "firebase/firestore";



// Defines a single rating given by one user to another.
export interface Rating {
  id?: string; 
  fromUserId: string; 
  sessionId: string; // Practice Session
  score: number; // Rating score (1 - 5)
  comment?: string; // Optional comment
  createdAt: Date; // Timestamp
}

// Stores overall reputation info for a user
export interface ReputationSummary {
  average: number; 
  count: number; 
}

// Firestore collection names
const RATINGS_COLLECTION = "ratings";
const REPUTATION_COLLECTION = "reputation";

/**
 * Rate another user and update their reputation summary.
 * If a rating already exists for the same session, update it instead.
 */
export const rateUser = async (
  targetUserId: string,
  fromUserId: string,
  sessionId: string,
  score: number,
  comment?: string
): Promise<void> => {
  if (targetUserId === fromUserId) {
    throw new Error("Users cannot rate themselves.");
  }

  if (score < 1 || score > 5) {
    throw new Error("Score must be between 1 and 5.");
  }

  try {
    // Reference to the target user’s ratings collection
    const userRatingsRef = collection(db, RATINGS_COLLECTION, targetUserId, "items");

    // Check if the user already rated this session
    const existingQ = query(
      userRatingsRef,
      where("fromUserId", "==", fromUserId),
      where("sessionId", "==", sessionId)
    );
    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
      // If Rating already exists, update it.
      const existingDoc = existingSnap.docs[0];
      await updateDoc(doc(db, RATINGS_COLLECTION, targetUserId, "items", existingDoc.id), {
        score,
        comment,
        updatedAt: serverTimestamp(),
      });

      // Fetch user’s reputation document
      const repRef = doc(db, REPUTATION_COLLECTION, targetUserId);
      const repSnap = await getDoc(repRef);

      if (repSnap.exists()) {
        // Recalculate average rating correctly
        const ratings = await getUserRatings(targetUserId);
        const newCount = ratings.length;
        const newAverage =
          ratings.reduce((sum, r) => sum + r.score, 0) / newCount;

        await updateDoc(repRef, { average: newAverage, count: newCount });
      }
      return;
    }

    // New rating (if no duplicates found, add it)
    const rating: Omit<Rating, "id"> = {
      fromUserId,
      sessionId,
      score,
      comment,
      createdAt: new Date(),
    };

    await addDoc(userRatingsRef, {
      ...rating,
      createdAt: serverTimestamp(),
    });

    // Update reputation summary
    const repRef = doc(db, REPUTATION_COLLECTION, targetUserId);
    const repSnap = await getDoc(repRef);

    if (!repSnap.exists()) {
      // If no reputation exists yet, create a new one
      await setDoc(repRef, { average: score, count: 1 });
    } else {
      // Update reputation by recalculating average
      const data = repSnap.data() as ReputationSummary;
      const newCount = data.count + 1;
      const newAverage = (data.average * data.count + score) / newCount;
      await updateDoc(repRef, { average: newAverage, count: increment(1) });
    }
  } catch (e: any) {
    if (e instanceof FirestoreError) {
      console.error("Failed to rate user:", e.message);
    }
    throw e;
  }
};

/**
 * Fetch all ratings a user has received.
 */
export const getUserRatings = async (userId: string): Promise<Rating[]> => {
  try {
    const ratingsRef = collection(db, RATINGS_COLLECTION, userId, "items");
    const snap = await getDocs(ratingsRef);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Rating, "id">),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));
  } catch (e: any) {
    console.error("Failed to fetch ratings for user:", userId, e);
    throw e;
  }
};

/**
 * Fetch the reputation summary (average score + total ratings) for a user.
 */
export const getUserReputation = async (
  userId: string
): Promise<ReputationSummary> => {
  try {
    const repRef = doc(db, REPUTATION_COLLECTION, userId);
    const snap = await getDoc(repRef);

    if (!snap.exists()) {
      return { average: 0, count: 0 };
    }
    return snap.data() as ReputationSummary;
  } catch (e: any) {
    console.error("Failed to fetch reputation for user:", userId, e);
    throw e;
  }
};

