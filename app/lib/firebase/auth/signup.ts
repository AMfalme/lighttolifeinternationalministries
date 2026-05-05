import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import firebase_app from "../config";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config";
import { userDetails } from "@/types/user";
import { generateFirebaseAuthErrorMessage } from "./firebaseErrorHandler";
import { FirebaseError } from "firebase/app";
import { AppDispatch } from "@/app/store/store";

const auth = getAuth(firebase_app);
export default async function signUp(
  email: string,
  password: string,
  dispatch: AppDispatch
) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up:", result);
    return { result, error: null };
  } catch (error) {
    console.error("Sign-up error:", error);

    if (error instanceof FirebaseError) {
      generateFirebaseAuthErrorMessage(error, dispatch);
    }

    return { result: null, error };
  }
}
export async function saveUserDetails(
  userId: string,
  userDetails: userDetails
) {
  const userInfo = await setDoc(doc(db, "users", userId), userDetails);
  console.log(userInfo);
  return { userInfo };
}
