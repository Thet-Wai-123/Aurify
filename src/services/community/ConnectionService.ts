/**
 * ConnectionService manages friend requests, connections, and user relationship status.
 *
 * It handles all social relationships between users. Friend requests, Connections, Blocking/unblocking users
 *
 */

import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, getDocs, deleteDoc, query, where, updateDoc, FirestoreError } from "firebase/firestore";

/**
 * Firestore Data Shapes
 * Friend request shape stored in Firestore
 */
export interface FriendRequest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

/**
 * Connection shape stored in Firestore.
 * Connections are stored twice A to B and B to A
 * so that queries for a user’s friends are efficient.
 */
export interface Connection {
  id?: string;
  userId: string;
  friendId: string;
  createdAt: Date;
}

/**
 * Block relationship shape stored in Firestore
 */
export interface Block {
  id?: string;
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

// Collection names used in Firestore
const REQUESTS_COLLECTION = "friendRequests";
const CONNECTIONS_COLLECTION = "connections";
const BLOCKS_COLLECTION = "blocks";

/* Helper utilities:
 * Check whether userId has blocked otherUserId.
 * Uses a Firestore query with two where() filters.
 */
export const isBlocked = async (userId: string, otherUserId: string): Promise<boolean> => {
  const q = query(collection(db, BLOCKS_COLLECTION), where("blockerId", "==", userId), where("blockedId", "==", otherUserId));

  const snap = await getDocs(q);
  return !snap.empty;
};

/**
 * Check whether two users are connected.
 */
export const isConnected = async (userId: string, friendId: string): Promise<boolean> => {
  const q = query(collection(db, CONNECTIONS_COLLECTION), where("userId", "==", userId), where("friendId", "==", friendId));
  const snap = await getDocs(q);
  return !snap.empty;
};

/**
 * Block a user.
 * Creates a block document and removes any existing connections both ways.
 */
export const blockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  if (blockerId === blockedId) {
    throw new Error("You cannot block yourself.");
  }

  // Prevent duplicate blocks
  if (await isBlocked(blockerId, blockedId)) {
    throw new Error("User already blocked.");
  }

  try {
    // Add block record
    await addDoc(collection(db, BLOCKS_COLLECTION), {
      blockerId,
      blockedId,
      createdAt: new Date(),
    });

    // Remove any existing connections in both parties
    await removeConnection(blockerId, blockedId);
    await removeConnection(blockedId, blockerId);
  } catch (e: any) {
    if (e instanceof FirestoreError) {
      console.error("Failed to block user:", e.message);
    }
    throw e;
  }
};

/**
 * Unblock a user.
 * Deletes the block document if one exists.
 */
export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  const q = query(collection(db, BLOCKS_COLLECTION), where("blockerId", "==", blockerId), where("blockedId", "==", blockedId));

  const snap = await getDocs(q);
  if (snap.empty) return;

  for (const docSnap of snap.docs) {
    await deleteDoc(doc(db, BLOCKS_COLLECTION, docSnap.id));
  }
};

/**
 * Friend Request:
 * Send a friend request from fromUserId to toUserId.
 *
 * Cannot send to self
 * Cannot send if either user blocked the other
 * Cannot send another request while one is already pending
 * If the other user already sent a pending request, reject.
 */
export const sendFriendRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
  if (fromUserId === toUserId) {
    throw new Error("Users cannot send requests to themselves.");
  }

  if ((await isBlocked(fromUserId, toUserId)) || (await isBlocked(toUserId, fromUserId))) {
    throw new Error("Cannot send request: user is blocked.");
  }

  try {
    // Check if a pending request already exists
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where("fromUserId", "==", fromUserId),
      where("toUserId", "==", toUserId),
      where("status", "==", "pending")
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error("Friend request already pending.");
    }

    // Also check the opposite direction
    const oppositeQ = query(
      collection(db, REQUESTS_COLLECTION),
      where("fromUserId", "==", toUserId),
      where("toUserId", "==", fromUserId),
      where("status", "==", "pending")
    );
    const opposite = await getDocs(oppositeQ);
    if (!opposite.empty) {
      throw new Error("A request from the other user is already pending.");
    }

    // Create request
    await addDoc(collection(db, REQUESTS_COLLECTION), {
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: new Date(),
    });
  } catch (e: any) {
    if (e instanceof FirestoreError) {
      console.error("Failed to send friend request:", e.message);
    }
    throw e;
  }
};

/**
 * Cancel a sent friend request.
 * Only possible if it is still pending.
 */
export const cancelFriendRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
  const q = query(
    collection(db, REQUESTS_COLLECTION),
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId),
    where("status", "==", "pending")
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

  for (const docSnap of snap.docs) {
    await deleteDoc(doc(db, REQUESTS_COLLECTION, docSnap.id));
  }
};

/**
 * Accept a friend request and create a two way connection.
 */
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  const reqRef = doc(db, REQUESTS_COLLECTION, requestId);
  const reqSnap = await getDoc(reqRef);

  if (!reqSnap.exists()) {
    throw new Error("Friend request not found.");
  }

  const reqData = reqSnap.data() as FriendRequest;
  if (reqData.status !== "pending") {
    throw new Error("Friend request is not pending.");
  }

  await updateDoc(reqRef, { status: "accepted" });

  // Create two connection docs
  await addDoc(collection(db, CONNECTIONS_COLLECTION), {
    userId: reqData.fromUserId,
    friendId: reqData.toUserId,
    createdAt: new Date(),
  });

  await addDoc(collection(db, CONNECTIONS_COLLECTION), {
    userId: reqData.toUserId,
    friendId: reqData.fromUserId,
    createdAt: new Date(),
  });
};

/**
 * Reject a friend request.
 * Only possible if it is still pending.
 */
export const rejectFriendRequest = async (requestId: string): Promise<void> => {
  const reqRef = doc(db, REQUESTS_COLLECTION, requestId);
  const reqSnap = await getDoc(reqRef);

  if (!reqSnap.exists()) {
    throw new Error("Friend request not found.");
  }

  const reqData = reqSnap.data() as FriendRequest;
  if (reqData.status !== "pending") {
    throw new Error("Friend request is not pending.");
  }

  await updateDoc(reqRef, { status: "rejected" });
};

/**
 * Remove a connection.
 */
export const removeConnection = async (userId: string, friendId: string): Promise<void> => {
  const q = query(collection(db, CONNECTIONS_COLLECTION), where("userId", "==", userId), where("friendId", "==", friendId));

  const snap = await getDocs(q);
  if (snap.empty) return;

  for (const docSnap of snap.docs) {
    await deleteDoc(doc(db, CONNECTIONS_COLLECTION, docSnap.id));
  }
};

/*
 * Query helpers:
 * Get all of a user’s connections (friends list).
 */
export const getConnections = async (userId: string): Promise<Connection[]> => {
  const q = query(collection(db, CONNECTIONS_COLLECTION), where("userId", "==", userId));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Connection, "id">),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  }));
};

/**
 * Get all pending friend requests addressed to a user.
 */
export const getPendingRequests = async (userId: string): Promise<FriendRequest[]> => {
  const q = query(collection(db, REQUESTS_COLLECTION), where("toUserId", "==", userId), where("status", "==", "pending"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<FriendRequest, "id">),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  }));
};
