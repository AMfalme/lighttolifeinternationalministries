import { createUserWithEmailAndPassword, getAuth, updateProfile } from "firebase/auth";
import firebase_app from "../config";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config";
import { userDetails } from "@/app/types/user";
import { generateFirebaseAuthErrorMessage } from "./firebaseErrorHandler";
import { FirebaseError } from "firebase/app";
import { AppDispatch } from "@/app/store/store";

const auth = getAuth(firebase_app);

const ensureUserDocument = async (
  uid: string,
  email: string | null,
  displayName: string | null,
) => {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      role: "user",
      email: email || "",
      displayName: displayName || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

export default async function signUp(
  email: string,
  password: string,
  displayName: string,
  dispatch?: AppDispatch,
) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName });
      await ensureUserDocument(result.user.uid, result.user.email, displayName);
    }
    console.log("User signed up:", result);
    return { result, error: null };
  } catch (error) {
    console.error("Sign-up error:", error);

    if (error instanceof FirebaseError && dispatch) {
      generateFirebaseAuthErrorMessage(error, dispatch);
    }

    return { result: null, error };
  }
}

export async function saveUserDetails(userId: string, userDetails: userDetails) {
  const userInfo = await setDoc(doc(db, "users", userId), userDetails);
  console.log(userInfo);
  return { userInfo };
}
