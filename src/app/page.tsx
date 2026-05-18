"use client";

import { Button } from "@/presentation/components/ui/Button";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#A3D14B]/10 via-white to-[#0B5B43]/10 font-sans">
      {/* Background Studio Visual (Subtle) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/auth-bg-glass.png"
          alt="Studio Background"
          fill
          className="object-cover opacity-20 grayscale"
          priority
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/60 p-12 md:p-20 text-center"
      >
        <div className="mb-12 flex justify-center">
           <Image src="/logo.png" alt="dbcolorsNG Logo" width={120} height={120} className="hover:scale-105 transition-transform duration-500" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter mb-8 leading-none">
          Unlock Your <span className="text-[#A3D14B]">Potential</span>
        </h1>
        
        <p className="text-xl text-neutral-600 mb-12 leading-relaxed max-w-lg mx-auto font-medium">
          Premium interior design courses crafted for the next generation of African creatives.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-black/10">
              Get Started <MoveRight className="w-5 h-5 ml-3" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold border-white/60 bg-white/40 backdrop-blur-md">
            View Courses
          </Button>
        </div>

        <div className="mt-16 pt-10 border-t border-black/5 flex items-center justify-center gap-8 opacity-40 grayscale">
           <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Lagos</span>
           <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Abuja</span>
           <span className="text-[10px] uppercase tracking-[0.3em] font-bold">London</span>
        </div>
      </motion.div>
    </main>
  );
}
