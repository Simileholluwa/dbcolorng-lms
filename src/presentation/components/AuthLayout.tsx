"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-start justify-start pt-20 lg:pt-0 lg:items-center md:justify-center p-4 relative overflow-hidden bg-white dark:bg-neutral-950">
      <motion.div
        layout
        transition={{ ease: "easeOut", duration: 0.3 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[440px] bg-white dark:bg-neutral-950 rounded-2xl shadow-sm shadow-black/5 dark:shadow-black/20 border border-neutral-100 dark:border-neutral-800 p-8 md:p-10 text-center transition-all duration-300"
      >
        <header className="mb-8 flex flex-col items-center">
          {/* Top Icon */}
          <div className="w-24 h-24 flex items-center justify-center">
            <Image src="/logo.png" alt="dbcolorsNG Logo" width={96} height={96} />
          </div>

          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2 tracking-tight">
            {title}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed px-6 max-w-xs mx-auto">
            {subtitle}
          </p>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
