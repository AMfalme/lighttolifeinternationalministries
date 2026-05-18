"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import firebaseApp from "./config";

export function useFastAuth(redirectTo?: string) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const auth = getAuth(firebaseApp);
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    }

    unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) {
        setUser(nextUser);
        setLoading(false);
        return;
      }

      setUser(null);
      setLoading(false);
      if (redirectTo) {
        router.push(redirectTo);
      }
    });

    return () => unsubscribe();
  }, [redirectTo, router]);

  return { user, loading };
}
