import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, "\n"),
};

const hasServiceAccount = Boolean(
  serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey,
);

const adminApp = (() => {
  if (getApps().length) {
    return getApps()[0];
  }

  return hasServiceAccount
    ? initializeApp({ credential: cert(serviceAccount) })
    : initializeApp();
})();

export const adminAuth = () => getAuth(adminApp);
export const adminDb = () => getFirestore(adminApp);
