import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log in | Space Builder",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to manage your Shopify landing pages.</p>
      </div>
      <LoginForm />
    </div>
  );
}

