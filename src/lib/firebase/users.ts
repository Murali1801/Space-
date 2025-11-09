"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase/client";

export const ensureUserDocument = async (
  uid: string,
  data: {
    email?: string | null;
    displayName?: string | null;
  },
) => {
  const db = getFirebaseFirestore();
  const ref = doc(db, "users", uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      email: data.email ?? null,
      displayName: data.displayName ?? null,
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(
      ref,
      {
        email: data.email ?? null,
        displayName: data.displayName ?? null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
};

