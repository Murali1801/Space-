import { type App, getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "@/lib/env";

let firebaseAdminApp: App | undefined;

export const getFirebaseAdminApp = () => {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (!env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    throw new Error("Firebase admin credentials are not set. Provide FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.");
  }

  firebaseAdminApp = getApps()[0] ??
    initializeApp({
      credential: cert({
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        projectId: env.FIREBASE_PROJECT_ID,
      }),
    });

  return firebaseAdminApp;
};

export const getFirebaseAdminFirestore = () => getFirestore(getFirebaseAdminApp());
