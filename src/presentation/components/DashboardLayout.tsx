"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  LogOut,
  Compass,
  Home,
  Trophy,
  User as UserIcon,
  Shield,
  Sun,
  Moon,
  Menu,
  X
} from "lucide-react";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useThemeStore } from "@/presentation/store/useThemeStore";

const isEmoji = (str: string | null | undefined): boolean => {
  if (!str) return false;
  return str.length <= 4 && !str.includes("/") && !str.includes(".");
};

const renderAvatar = (photoUrl: string | null | undefined, displayName: string, textClass: string) => {
  if (!photoUrl) {
    const initials = displayName ? displayName[0] : "?";
    return (
      <div className={`w-full h-full bg-[#A3D14B] flex items-center justify-center text-white font-bold ${textClass}`}>
        {initials.toUpperCase()}
      </div>
    );
  }
  if (isEmoji(photoUrl)) {
    return (
      <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center select-none text-base">
        {photoUrl}
      </div>
    );
  }
  return (
    <img 
      src={photoUrl} 
      alt={displayName} 
      className="w-full h-full object-cover" 
      onError={(e) => {
        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=A3D14B`;
      }}
    />
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    // Read saved theme or fallback to user preferences
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);
  }, [setTheme]);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user && !user.email_verified) {
        router.push("/verify-email-sent");
      }
    }
  }, [mounted, isAuthenticated, user, router]);

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
              <span className={`text-[10px] font-bold tracking-tight ${item.active ? "opacity-100 text-[#A3D14B]" : "opacity-80 group-hover:opacity-100 dark:text-neutral-400"}`}>
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

          <div className="w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/50">
            {renderAvatar(user.photo_url, user.display_name, "text-sm")}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between pl-6 pr-4 py-2 bg-white dark:bg-neutral-950 border-b border-black/5 dark:border-white/5 sticky top-0 z-50 transition-colors h-16">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="dbcolorsNG" width={48} height={48} className="w-14 h-14 object-contain" />
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-1.5 mr-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-400 dark:text-neutral-300 transition-all cursor-pointer"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
          )}

          <Link href="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/10 hover:scale-105 transition-transform flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/50 block">
            {renderAvatar(user.photo_url, user.display_name, "text-xs")}
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-xl text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-8 lg:pb-0">
        <div className="max-w-7xl w-full mx-auto px-6 lg:px-16 py-8 lg:py-12">
          {children}
        </div>
      </main>

      {/* Mobile Drawer Menu Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />

            {/* Menu Drawer (Slides from Right) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 right-0 w-[280px] bg-white dark:bg-neutral-950 border-l border-black/5 dark:border-white/5 z-50 flex flex-col p-4 transition-colors lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Image src="/logo.png" alt="dbcolorsNG" width={48} height={48} className="w-14 h-14 object-contain" />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl border border-black/5 dark:border-white/5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Section */}
              <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
                {sidebarItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-bold text-sm ${item.active
                      ? "bg-black text-white dark:bg-[#A3D14B]/10 dark:text-primary"
                      : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                      }`}
                  >
                    <item.icon className="w-5 h-5" strokeWidth={item.active ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Drawer Footer Controls */}
              <div className="border-t border-black/5 dark:border-white/5 pt-6 space-y-4">
                {/* User info snippet */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-900">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5 shrink-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/50">
                    {renderAvatar(user.photo_url, user.display_name, "text-sm")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate text-neutral-900 dark:text-white">{user.display_name}</p>
                    <p className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider">
                      {isAdmin ? "Administrator" : "Student Learner"}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
