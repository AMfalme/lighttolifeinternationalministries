import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config";
import { generateFirebaseAuthErrorMessage } from "./firebaseErrorHandler";
import { FirebaseError } from "firebase/app";

import { AppDispatch } from "@/app/store/store";

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

export default async function LogInWithEmailAndPassword(
  email: string,
  password: string,
  dispatch?: AppDispatch
) {
  let result;
  const error = null;
  try {
    if (!auth) {
      throw new Error("Authentication is not available right now.");
    }

    result = await signInWithEmailAndPassword(auth, email, password);
    console.log("sign in with email and password response: ", result);

    if (result?.user) {
      await ensureUserDocument(result.user.uid, result.user.email, result.user.displayName);
    }
  } catch (error) {
    if (error instanceof FirebaseError && dispatch) {
      generateFirebaseAuthErrorMessage(error, dispatch);
    }

    return { result: null, error };
  }
  console.log(result, error);
  return { result, error };
}
