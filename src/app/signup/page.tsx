import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create account | Space Builder",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-white">Start building with Space</h1>
        <p className="mt-2 text-sm text-slate-400">Create an account to connect your Shopify store and launch new pages.</p>
      </div>
      <SignupForm />
    </div>
  );
}

