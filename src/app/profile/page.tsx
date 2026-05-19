"use client";

import DashboardLayout from "@/presentation/components/DashboardLayout";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-neutral-400 font-bold uppercase tracking-widest animate-pulse">
          profile content here
        </p>
      </div>
    </DashboardLayout>
  );
}
