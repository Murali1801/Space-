"use client";

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getFirebaseFirestore } from "@/lib/firebase/client";
import { useAuth } from "./useAuth";

export type WorkspaceRecord = {
  id: string;
  name: string;
  shopIds: string[];
  shopLabels: Record<string, string>;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type WorkspaceSummary = WorkspaceRecord & {
  owner: string;
  shops: Array<{
    id: string;
    name: string;
    installedAt: string | null;
  }>;
};

const STORAGE_KEY = "space.activeWorkspace";

const toIsoString = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return null;
    }
  }
  return null;
};

export const useWorkspaces = () => {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<WorkspaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setActiveWorkspaceId(null);
      setLoading(false);
      return;
    }

    const db = getFirebaseFirestore();
    const ref = collection(db, "users", user.uid, "workspaces");
    const q = query(ref, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: WorkspaceRecord[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as DocumentData | undefined;
          const shopLabels: Record<string, string> = {};
          if (data?.shopLabels && typeof data.shopLabels === "object" && !Array.isArray(data.shopLabels)) {
            Object.entries(data.shopLabels).forEach(([key, value]) => {
              if (typeof key === "string" && typeof value === "string") {
                shopLabels[key] = value;
              }
            });
          }
          next.push({
            id: docSnapshot.id,
            name: typeof data?.name === "string" && data.name.trim().length ? data.name : "Untitled workspace",
            shopIds: Array.isArray(data?.shopIds)
              ? (data?.shopIds.filter((id) => typeof id === "string" && id.length > 0) as string[])
              : [],
            shopLabels,
            createdAt: toIsoString(data?.createdAt),
            updatedAt: toIsoString(data?.updatedAt),
          });
        });
        setRecords(next);
        setLoading(false);
      },
      () => {
        setRecords([]);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActiveWorkspaceId(stored);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (activeWorkspaceId) {
      window.localStorage.setItem(STORAGE_KEY, activeWorkspaceId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!records.length) {
      setActiveWorkspaceId((current) => (current ? current : null));
      return;
    }
    setActiveWorkspaceId((current) => {
      if (current && records.some((record) => record.id === current)) {
        return current;
      }
      return records[0]?.id ?? null;
    });
  }, [records]);

  const createWorkspace = useCallback(
    async (name: string) => {
      if (!user) return;
      const db = getFirebaseFirestore();
      const ref = collection(db, "users", user.uid, "workspaces");
      const created = await addDoc(ref, {
        name: name.trim() || "Untitled workspace",
        shopIds: [],
        shopLabels: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveWorkspaceId(created.id);
    },
    [user],
  );

  const renameWorkspace = useCallback(
    async (workspaceId: string, name: string) => {
      if (!user) return;
      if (!workspaceId) return;
      const db = getFirebaseFirestore();
      const ref = doc(db, "users", user.uid, "workspaces", workspaceId);
      await updateDoc(ref, {
        name: name.trim() || "Untitled workspace",
        updatedAt: serverTimestamp(),
      });
    },
    [user],
  );

  const deleteWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!user) return;
      const db = getFirebaseFirestore();
      const ref = doc(db, "users", user.uid, "workspaces", workspaceId);
      await deleteDoc(ref);
    },
    [user],
  );

  const addShopToWorkspace = useCallback(
    async (workspaceId: string, shopDomain: string, label?: string) => {
      if (!user || !workspaceId) return;
      const db = getFirebaseFirestore();
      const ref = doc(db, "users", user.uid, "workspaces", workspaceId);
      const updates: Record<string, unknown> = {
        shopIds: arrayUnion(shopDomain),
        updatedAt: serverTimestamp(),
      };
      if (label && label.trim().length) {
        updates[`shopLabels.${shopDomain}`] = label.trim();
      }
      await updateDoc(ref, updates);
    },
    [user],
  );

  const removeShopFromWorkspace = useCallback(
    async (workspaceId: string, shopDomain: string) => {
      if (!user || !workspaceId) return;
      const db = getFirebaseFirestore();
      const ref = doc(db, "users", user.uid, "workspaces", workspaceId);
      await updateDoc(ref, {
        shopIds: arrayRemove(shopDomain),
        [`shopLabels.${shopDomain}`]: deleteField(),
        updatedAt: serverTimestamp(),
      });
    },
    [user],
  );

  const ownerLabel = useMemo(
    () =>
      profile?.displayName ??
      user?.displayName ??
      profile?.email ??
      user?.email ??
      "Workspace owner",
    [profile?.displayName, profile?.email, user?.displayName, user?.email],
  );

  const workspaces: WorkspaceSummary[] = useMemo(() => {
    return records.map((record) => ({
      ...record,
      owner: ownerLabel,
      shops:
        record.shopIds
          .map((id) => {
            const shop = profile?.shops?.[id];
            return {
              id,
              name: record.shopLabels[id] ?? shop?.domain ?? id,
              installedAt: shop?.installedAt ?? null,
            };
          })
          .filter(Boolean) ?? [],
    }));
  }, [records, profile?.shops, ownerLabel]);

  return {
    workspaces,
    loading,
    activeWorkspaceId,
    setActiveWorkspaceId,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    addShopToWorkspace,
    removeShopFromWorkspace,
  };
};


