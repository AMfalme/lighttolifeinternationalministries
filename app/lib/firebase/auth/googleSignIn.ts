// lib/firebase/auth/googleSignIn.ts
import { getAuth } from "firebase/auth";
import firebase_app from "../config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const auth = getAuth(firebase_app);

const ensureUserDocument = async (uid: string, email: string | null, displayName: string | null) => {
  if (!db) {
    return;
  }

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      role: "user",
      email: email || "",
      displayName: displayName || "",
    });
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);

    if (result?.user) {
      await ensureUserDocument(result.user.uid, result.user.email, result.user.displayName);
    }

    return { result };
  } catch (error) {
    console.log(error)
    return { error };
  }
};
