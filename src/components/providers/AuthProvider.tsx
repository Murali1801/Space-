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
      lastPublishedThemeId?: number | null;
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
      if (!snapshot.exists()) {
        setProfile(null);
        return;
      }

      const raw = snapshot.data() as DocumentData;

      const toIsoString = (value: unknown) => {
        if (!value) {
          return undefined;
        }
        if (typeof value === "string") {
          return value;
        }
        if (typeof (value as { toDate?: () => Date }).toDate === "function") {
          try {
            return (value as { toDate: () => Date }).toDate().toISOString();
          } catch {
            return undefined;
          }
        }
        return undefined;
      };

      const shops: NonNullable<UserProfile["shops"]> = {};

      const hydrateShop = (domain: string, value: unknown) => {
        if (!domain) {
          return;
        }

        const record =
          value && typeof value === "object"
            ? (value as { installedAt?: unknown; lastPublishedAt?: unknown; lastPublishedThemeId?: unknown })
            : undefined;

        shops[domain] = {
          domain,
          installedAt: toIsoString(record?.installedAt) ?? undefined,
          lastPublishedAt: toIsoString(record?.lastPublishedAt) ?? null,
          lastPublishedThemeId:
            typeof record?.lastPublishedThemeId === "number" ? record.lastPublishedThemeId : null,
        };
      };

      if (raw.shops && typeof raw.shops === "object" && !Array.isArray(raw.shops)) {
        Object.entries(raw.shops).forEach(([domain, value]) => hydrateShop(domain, value));
      }

      Object.entries(raw)
        .filter(([key]) => key.startsWith("shops.") && key.length > "shops.".length)
        .forEach(([key, value]) => {
          const domain = key.replace(/^shops\./, "");
          hydrateShop(domain, value);
        });

      const profileData: UserProfile = {
        email: raw.email ?? null,
        displayName: raw.displayName ?? null,
        lastConnectedShop: raw.lastConnectedShop ?? null,
        shops: Object.keys(shops).length ? shops : undefined,
      };

      setProfile(profileData);
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

