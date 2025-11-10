"use client";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-black">
      <iframe
        src="/replo-dashboard.html"
        title="Space Dashboard"
        className="h-screen w-full border-none"
      />
    </div>
  );
}

