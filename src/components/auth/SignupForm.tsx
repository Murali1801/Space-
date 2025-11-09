"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase/client";
import { ensureUserDocument } from "@/lib/firebase/users";

const provider = new GoogleAuthProvider();

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectPath = searchParams.get("redirect") ?? "/app";

  const handleEmailSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const auth = getFirebaseAuth();

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      await ensureUserDocument(result.user.uid, {
        email: result.user.email,
        displayName: displayName || result.user.displayName,
      });

      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message ?? "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    const auth = getFirebaseAuth();

    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
      });
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message ?? "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-slate-950/80 p-8 shadow-lg shadow-indigo-500/10">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Create your Space account</h1>
        <p className="text-sm text-slate-400">Sign up with email or Google, then connect your Shopify store.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
      ) : null}

      <form className="space-y-4" onSubmit={handleEmailSignup}>
        <label className="space-y-1 text-sm">
          <span className="text-slate-200">Full name</span>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            placeholder="Ada Lovelace"
            autoComplete="name"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-200">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-200">Password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span>Sign up with Google</span>
      </button>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-300 transition hover:text-indigo-200">
          Log in
        </Link>
      </p>
    </div>
  );
}

