"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Compass,
  Home,
  Trophy,
  User as UserIcon,
  Shield,
  Sun,
  Moon
} from "lucide-react";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useThemeStore } from "@/presentation/store/useThemeStore";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read saved theme or fallback to user preferences
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
  }, [setTheme]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !user) return null;

  const isAdmin = user.roles?.includes("admin");

  const sidebarItems = [
    { icon: Compass, label: "Explore", href: "/dashboard", active: pathname === "/dashboard" },
    { icon: Home, label: "Home", href: "/home", active: pathname === "/home" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard", active: pathname === "/leaderboard" },
    { icon: UserIcon, label: "Profile", href: "/profile", active: pathname === "/profile" },
  ];

  if (isAdmin) {
    sidebarItems.push({
      icon: Shield,
      label: "Admin",
      href: "/dashboard/admin",
      active: pathname.startsWith("/dashboard/admin")
    });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[90px] bg-white dark:bg-neutral-950 border-r border-black/5 dark:border-white/5 flex-col items-center py-6 z-50 sticky top-0 h-screen transition-colors">
        {/* Logo Section */}
        <Link href="/dashboard" className="mb-6">
          <Image src="/logo.png" alt="dbcolorsNG" width={52} height={52} className="w-16 h-16 object-contain" />
        </Link>

        {/* Navigation Section */}
        <nav className="flex-1 flex flex-col w-full">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-4 w-full transition-all group ${item.active
                ? "bg-black dark:bg-[#A3D14B]/10"
                : "text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${item.active ? "text-[#A3D14B]" : "text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white"}`} strokeWidth={item.active ? 2.5 : 2} />
              <span className={`text-[9px] font-bold uppercase tracking-tight ${item.active ? "opacity-100 text-[#A3D14B]" : "opacity-80 group-hover:opacity-100 dark:text-neutral-400"}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto flex flex-col gap-4 items-center w-full">
          {/* Light / Dark Mode Switcher */}
          {mounted && (
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
              className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition-all transform hover:rotate-12 cursor-pointer"
            >
              {theme === "light" ? (
                <Moon className="w-6 h-6" />
              ) : (
                <Sun className="w-6 h-6 text-amber-400" />
              )}
            </button>
          )}

          <button className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition-all transform hover:rotate-12 cursor-pointer">
            <Bell className="w-6 h-6" />
          </button>

          <button
            onClick={logout}
            title="Logout"
            className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-600 transition-all transform hover:rotate-12 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer hover:scale-110 transition-transform">
            {user.photo_url ? (
              <Image src={user.photo_url} alt={user.display_name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#A3D14B] flex items-center justify-center text-white font-bold text-sm">
                {user.display_name[0]}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-6 py-2 bg-white dark:bg-neutral-950 border-b border-black/5 dark:border-white/5 sticky top-0 z-50 transition-colors">
        <Image src="/logo.png" alt="dbcolorsNG" width={64} height={64} className="w-16 h-16 object-contain" />
        <div className="flex items-center gap-3">
          {/* Mobile Light / Dark Switcher */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-300 transition-all cursor-pointer"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          <button
            className="p-2 rounded-full border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-300 transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-full overflow-hidden border border-black/10 dark:border-white/10">
            {user.photo_url ? (
              <Image src={user.photo_url} alt={user.display_name} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#A3D14B] flex items-center justify-center text-white font-bold text-sm">
                {user.display_name[0] + user.display_name.split(' ').pop()?.[0]}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-16 py-8 lg:py-12">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-950 border-t border-black/5 dark:border-white/5 px-4 py-2 z-50 flex justify-around items-center transition-colors">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${item.active ? "text-black dark:text-white" : "text-neutral-400 dark:text-neutral-500"
              }`}
          >
            <item.icon className="w-6 h-6" strokeWidth={item.active ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-tight uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
