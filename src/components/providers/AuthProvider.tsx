import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase/client";

type UserProfile = {
  email?: string | null;
  displayName?: string | null;
  shops?: Record<
    string,
    {
      domain: string;
      installedAt?: string;
      lastPublishedAt?: string | null;
    }
  >;
  lastConnectedShop?: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const db = getFirebaseFirestore();
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile((snapshot.data() as DocumentData) as UserProfile);
      } else {
        setProfile(null);
      }
    });

    return unsubscribe;
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      profile,
    }),
    [user, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

