"use client";

import DashboardLayout from "@/presentation/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-neutral-400 font-bold uppercase tracking-widest animate-pulse">
          content here
        </p>
      </div>
    </DashboardLayout>
  );
}
