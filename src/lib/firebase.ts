// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { createUserProfile, getUserProfile, setCurrentUser } from "@/services/profileService";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Because of unknown SID issues
});

auth.onAuthStateChanged(async (user) => { // Is called when user is signed in/out
  if (user) { // User is signed in
    console.debug("HELLO ", user.uid);
    try {
      let userProfile = await getUserProfile(user.uid);
      if (userProfile === null) {
        userProfile = await createUserProfile(user.uid, {
          displayName: user.displayName,
          profilePicture: user.photoURL,
        });
      }
      setCurrentUser(userProfile);
    } catch (e: any) {
      console.error("UH OH: ", e)
    }
  } else { // User is signed out

  }
});

