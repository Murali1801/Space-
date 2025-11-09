import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const getFirebaseApp = () => (getApps().length ? getApp() : initializeApp(firebaseConfig));

export const getFirebaseAuth = () => {
  if (typeof window === "undefined") {
    throw new Error("getFirebaseAuth can only be called on the client");
  }

  return getAuth(getFirebaseApp());
};

export const getFirebaseFirestore = () => getFirestore(getFirebaseApp());

export const getFirebaseAnalytics = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isAnalyticsSupported();
  return supported ? getAnalytics(getFirebaseApp()) : null;
};
