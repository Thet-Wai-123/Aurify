import { CollectionBaseImpl, db, usersRef } from "@/lib/firebase";
import { collection, CollectionReference, deleteDoc, doc, FirestoreError, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";

export const enum VOICE_TYPES {
  MALE = "male",
  FEMALE = "female",
  ANIMAL = "animal"
}
export const DEFAULT_USER_PROFILE: Readonly<UserProfile> = {
  displayName: "John Doe",
  username: "username",
  bio: "Hi! I am a jellyfish!",
  color: "#6d5ef5",
  profilePicture: "",
  banner: "",
  goals: [],
  resumeFile: "", // Yeah I don't think I can store files here
  jellyfishName: "Auri",
  voice: VOICE_TYPES.ANIMAL,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
} as const;

let currentUserRef: UserProfile | null = null;

export const setCurrentUser = (user: UserProfile | null) => {
  currentUserRef = user;
}

export const getCurrentUser = (): Readonly<UserProfile> => currentUserRef;


export interface UserProfile extends CollectionBaseImpl {
  displayName: string,
  username: string,
  bio: string,
  color: string,
  profilePicture: string,
  banner: string,
  goals: string[],
  resumeFile: URL | string, // Yeah I don't think I can store files here
  jellyfishName: string,
  voice: VOICE_TYPES,
}

// TODO: Should I keep this?
// const _handleFirestoreError = async (error: FirestoreError|any, uid: string): Promise<UserProfile> => {
//   if (!(error instanceof FirestoreError)) {
//     console.error(`bruh 😵‍💫 this ain’t even a FirestoreError 🤡 what r u doing?`);
//     throw error;
//   }
//   switch (error.code) {
//     case "unauthenticated":
//       console.error("bruh ur mad unauthed gng 🥀");
//       throw error;
//     case "already-exists":
//       console.error(`oh joy 😒 another duplicate. fine, here’s your precious profile: ${uid}`);
//       return await getUserProfile(uid);
//     case "permission-denied":
//       console.error(`aww… no access for you 😭 rip bozo 💀 Firestore built different. (dis u btw ${uid})`);
//       throw error;
//     case "invalid-argument":
//       console.error(`invalid argument? lol who taught you (${uid}) to code 🤡 rip bozo 💀 `);
//       throw error;
//     case "cancelled":
//       console.error(`lol you’ve been cancelled by Firestore. trend #DoBetter #Cancel${uid} 🤡 `);
//       throw error;
//     case "deadline-exceeded":
//       console.error(`bro… you took longer than a Windows update 😭 user ${uid} deadline exceeded. Firestore just dipped.`);
//       throw error;
//     case "not-found":
//       console.error(`doc missing, brain missing, vibes missing 😭 ${uid}`);
//       throw error;
//     case "resource-exhausted":
//       console.error(`all resources stolen 😭 ${uid} hacker? jk, just trash.`);
//       throw error;
//     case "failed-precondition":
//       console.error(`lmao precondition failed 🤡 maybe read a manual next time ${uid}?`);
//       throw error;
//     case "aborted":
//       console.error(`bruh wtf 😭 mid-flight abort. Firestore said “go cry somewhere else ${uid}” 🤡`);
//       throw error;
//     case "out-of-range":
//       console.error(`lmao nope 😭 that number bigger than ur IQ? ur code too extra ${uid} 😩`);
//       throw error;
//     case "unimplemented":
//       console.error(`unimplemented again 🤡 maybe try a real API next time 😭 ${uid})`);
//       throw error;
//     case "internal":
//       console.error(`lol wtf 🤡 internal error. Firestore itself broke. ur chaos energy too strong 😵‍💫${uid}`);
//       throw error;
//     case "unavailable":
//       console.error(`lol bruh 😩 Firestore unavailable again 🤯 u really thought it would work? ${uid} 🤡`);
//       throw error;
//     case "data-loss":
//       console.error(`lol 😩 Firestore deleted ur stuff… kinda like ur dad deleted responsibilities ${uid} 🤡`);
//       throw error;
//     case "unknown":
//       console.error(`lmao 🤯 unknown error. Firestore confused… kinda like ur life ${uid} 🤡 `);
//       throw error;
//     default:
//       console.error(`dawg why is this failing? User: ${uid}`);
//       throw error;
//   }
// }

export const getColRef = (): Readonly<CollectionReference> => usersRef;

export const setUserProfile = async (uid: string, data: UserProfile): Promise<void> => {
  const docRef = doc(usersRef, uid);
  try {
    await setDoc(docRef, data, {
      merge: false
    });
  } catch (e: any) {
    // TODO: Make this fail more elegantly.
    console.error("Cannot set userProfile!");
    throw e;
  }
}
export const deleteUserProfile = async (uid: string): Promise<void> => {
  const docRef = doc(usersRef, uid);
  try {
    await deleteDoc(docRef);
  } catch (e: any) {
    // TODO: Make this fail more elegantly.
    console.error("Cannot delete userProfile!");
    throw e;
  }
}
export const getUserProfile = async (uid: string): Promise<Readonly<UserProfile> | null> => {
  const docRef = doc(usersRef, uid);
  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists) { return null; }
    return {
      ...docSnap.data()
    } as UserProfile;
  } catch (e: any) {
    // TODO: Make this fail more elegantly.
    console.error("Cannot get userProfile!");
    throw e;
  }
}

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const docRef = doc(usersRef, uid);
  try {
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    } as Partial<UserProfile>);
  } catch (e: any) {
    // TODO: Make this fail more elegantly.
    console.error("Cannot update userProfile!");
    throw e;
  }
}

export const upsertUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const docSnap = await getUserProfile(uid);
    if (docSnap === null) {
      await setUserProfile(uid, data as UserProfile);
    } else {
      await updateUserProfile(uid, data);
    }
  } catch (e: any) {
    // TODO: Make this fail more elegantly.
    console.error("Cannot upsert userProfile!");
    throw e;
  }
}

export const createUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    await setUserProfile(uid, {
      ...data,
      ...DEFAULT_USER_PROFILE
    });
    return await getUserProfile(uid);

  } catch (e: any) {
    // TODO: Make this fail more elegantly.
    if (e instanceof FirestoreError && e.code === "already-exists") {
      console.warn("userProfile already exists! returning userProfile")
      return await getUserProfile(uid);
    }
    console.error("Cannot create userProfile!");
    throw e;
  }
}


