import { FirebaseError } from "firebase/app";
import { addNotification } from "@/app/store/features/notificationSlice";
import { AppDispatch } from "@/app/store/store";

// https://firebase.google.com/docs/auth/admin/errors
export const generateFirebaseAuthErrorMessage = (
  error: FirebaseError,
  dispatch: AppDispatch
) => {
  const messages: Record<string, string> = {
    "auth/invalid-email": "Invalid email address. Please enter a valid email.",
    "auth/user-not-found": "User not found. Please check the email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "Email already in use. Try another.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/operation-not-allowed": "Operation not allowed. Try again later.",
    "auth/invalid-verification-code": "Invalid verification code.",
    "auth/invalid-verification-id": "Invalid verification ID.",
    "auth/code-expired": "Code expired. Please request a new one.",
    "auth/invalid-action-code": "Invalid action code.",
    "auth/user-disabled": "This user is disabled. Contact support.",
    "auth/invalid-credential":
      "Invalid auth credentials. Check your input and try again.",
    "auth/invalid-continue-uri": "Invalid continue URL.",
    "auth/unauthorized-continue-uri": "Unauthorized continue URL.",
    "auth/missing-continue-uri": "Missing continue URL.",
    "auth/captcha-check-failed": "Captcha check failed.",
    "auth/invalid-phone-number": "Invalid phone number.",
    "auth/missing-phone-number": "Phone number is required.",
    "auth/quota-exceeded": "Quota exceeded. Try later.",
    "auth/network-request-failed": "Network error. Check connection.",
    "auth/requires-recent-login": "Log in again to continue.",
    "auth/too-many-requests": "Too many requests. Try later.",
    "auth/user-token-expired": "Session expired. Log in again.",
    "auth/invalid-api-key": "Invalid API key. Contact support.",
    "auth/internal-error": "An internal error occurred. Try again later.",
  };

  const message = messages[error?.code] || "Oops! Something went wrong.";

  dispatch(addNotification({ message, type: "error" }));
};
