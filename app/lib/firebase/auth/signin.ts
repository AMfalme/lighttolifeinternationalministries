import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config";
import { generateFirebaseAuthErrorMessage } from "./firebaseErrorHandler";
import { FirebaseError } from "firebase/app";

import { AppDispatch } from "@/app/store/store";

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
    // const user = result.user;
  } catch (error) {
    if (error instanceof FirebaseError && dispatch) {
      generateFirebaseAuthErrorMessage(error, dispatch);
    }

    return { result: null, error };
  }
  console.log(result, error);
  return { result, error };
}
