"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(getFirebaseAuth());
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}

