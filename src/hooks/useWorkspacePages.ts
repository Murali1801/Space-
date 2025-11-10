"use client";

import {
  addDoc,
  collection,
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

export type WorkspacePageRecord = {
  id: string;
  name: string;
  type: "Page" | "Product template" | "Section" | "Blog";
  status: "live" | "draft";
  lastEdited?: string | null;
  shopDomain?: string | null;
};

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

export const useWorkspacePages = (workspaceId: string | null | undefined) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<WorkspacePageRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !workspaceId) {
      setRecords([]);
      return;
    }

    const db = getFirebaseFirestore();
    const ref = collection(db, "users", user.uid, "workspaces", workspaceId, "pages");
    const q = query(ref, orderBy("updatedAt", "desc"));

    setLoading(true);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next: WorkspacePageRecord[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as DocumentData | undefined;
          next.push({
            id: docSnapshot.id,
            name: typeof data?.name === "string" && data.name.length ? data.name : "Untitled page",
            type: (data?.type as WorkspacePageRecord["type"]) ?? "Page",
            status: data?.status === "live" ? "live" : "draft",
            shopDomain: typeof data?.shopDomain === "string" ? data.shopDomain : null,
            lastEdited: toIsoString(data?.updatedAt) ?? toIsoString(data?.lastEdited),
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
  }, [user, workspaceId]);

  const createPage = useCallback(
    async (input: { name: string; type?: WorkspacePageRecord["type"]; shopDomain?: string | null }) => {
      if (!user || !workspaceId) return null;
      const db = getFirebaseFirestore();
      const ref = collection(db, "users", user.uid, "workspaces", workspaceId, "pages");

      const docRef = await addDoc(ref, {
        name: input.name.trim() || "Untitled page",
        type: input.type ?? "Page",
        status: "draft",
        shopDomain: input.shopDomain ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    },
    [user, workspaceId],
  );

  const updatePage = useCallback(
    async (pageId: string, updates: Partial<Omit<WorkspacePageRecord, "id">>) => {
      if (!user || !workspaceId || !pageId) return;
      const db = getFirebaseFirestore();
      const ref = doc(db, "users", user.uid, "workspaces", workspaceId, "pages", pageId);
      const payload: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.name !== undefined) {
        payload.name = updates.name.trim() || "Untitled page";
      }
      if (updates.type) {
        payload.type = updates.type;
      }
      if (updates.status) {
        payload.status = updates.status;
      }
      if (updates.shopDomain !== undefined) {
        payload.shopDomain = updates.shopDomain;
      }
      await updateDoc(ref, payload);
    },
    [user, workspaceId],
  );

  const deletePage = useCallback(
    async (pageId: string) => {
      if (!user || !workspaceId || !pageId) return;
      const db = getFirebaseFirestore();
      const ref = doc(db, "users", user.uid, "workspaces", workspaceId, "pages", pageId);
      await deleteDoc(ref);
    },
    [user, workspaceId],
  );

  const lastUpdatedAt = useMemo(() => records[0]?.lastEdited ?? null, [records]);

  return {
    pages: records,
    loading,
    lastUpdatedAt,
    createPage,
    updatePage,
    deletePage,
  };
};


