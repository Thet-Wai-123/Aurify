// NOTE: This auth system uses FP principles.
// TODO: Look into OOP implementation
// 

import { auth } from "@/lib/firebase"
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, PasswordValidationStatus, Persistence, setPersistence, signInWithEmailAndPassword, User, validatePassword } from "firebase/auth"
import { createUserProfile, getUserProfile, setCurrentUser } from "@/services/profileService";

export class PasswordError extends Error {
  // We omit these keys because they aren't neccessary for this error type
  // We also make this readonly because why would the property need to be modified (makes it like a const var)
  // Also this way we can use this for the login page :)
  readonly validationStatus: Omit<PasswordValidationStatus, 'isValid' | 'passwordPolicy'>
  constructor(validationStatus: Omit<PasswordValidationStatus, 'isValid' | 'passwordPolicy'>) {
    super(`Password is not valid!:\n
      ${Object.entries(validationStatus)
        // We want to filter out values that aren't covered by policy 
        // TODO: Does even work with different policies?
        .filter(([_, value]) => value === false)
        // Break this into key: value pairs, because verbosity isn't needed
        .map(([key, value]) => `${key}: ${value}`).join('\n')}\n
      `);
    this.validationStatus = validationStatus;
  }
}

export async function aurifySignIn(email: string, password: string, persistance: Persistence = { type: "LOCAL" }): Promise<User> {
  try {
    setPersistence(auth, persistance);
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    return userCreds.user;
  } catch (e: any) {
    if (e instanceof FirebaseError) {
      console.log(`Can't sign in for: ${email} : ${password}`);
    }
    throw e;
  }
}

export async function aurifySignUp(email: string, password: string, persistance: Persistence = { type: "LOCAL" }): Promise<User> {
  // Check if passord matches current firebase password config
  try {
    await setPersistence(auth, persistance);
    const passwordValidationState = await validatePassword(auth, password);
    if (!passwordValidationState.isValid) {
      // If password can't be used
      throw new PasswordError(passwordValidationState);
    }
    const userCreds = await createUserWithEmailAndPassword(auth, email, password);
    return userCreds.user;
  } catch (e: any) {
    if (e instanceof FirebaseError) {
      console.log(`Can't sign up for: ${email} : ${password}`);
    }
    throw e;
  }
}

export const AURIFY_GUEST: string = "aurify_guest" as const;

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