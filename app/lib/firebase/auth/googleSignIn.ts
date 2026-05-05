// lib/firebase/auth/googleSignIn.ts
import { getAuth } from "firebase/auth";
import firebase_app from "../config";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const auth = getAuth(firebase_app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return { result };
  } catch (error) {
    console.log(error)
    return { error };
  }
};
