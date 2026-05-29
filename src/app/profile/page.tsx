"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useAuth } from "@/presentation/hooks/useAuth";
import { useLms } from "@/presentation/hooks/useLms";
import { Certificate } from "@/domain/entities/LMS";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Settings,
  Printer,
  X,
  User as UserIcon,
  Check,
  Globe,
  Loader2
} from "lucide-react";

const PRESET_AVATARS = [
  { emoji: "🦁", label: "Lion", bgColor: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:bg-orange-500/5 dark:border-orange-500/10" },
  { emoji: "🦊", label: "Fox", bgColor: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-amber-500/5 dark:border-amber-500/10" },
  { emoji: "🐼", label: "Panda", bgColor: "bg-neutral-500/10 border-neutral-500/20 text-neutral-600 dark:bg-neutral-500/5 dark:border-neutral-500/10" },
  { emoji: "🐨", label: "Koala", bgColor: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:bg-blue-500/5 dark:border-blue-500/10" },
  { emoji: "🐯", label: "Tiger", bgColor: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:bg-yellow-500/5 dark:border-yellow-500/10" },
  { emoji: "🦉", label: "Owl", bgColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:bg-emerald-500/5 dark:border-emerald-500/10" },
  { emoji: "🦄", label: "Unicorn", bgColor: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:bg-purple-500/5 dark:border-purple-500/10" },
  { emoji: "🦅", label: "Eagle", bgColor: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:bg-sky-500/5 dark:border-sky-500/10" },
];

const isEmoji = (str: string | null | undefined): boolean => {
  if (!str) return false;
  return str.length <= 4 && !str.includes("/") && !str.includes(".");
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { updateProfile, isUpdatingProfile } = useAuth();
  const { useGetCertificates } = useLms();
  const { data: certificates = [], isLoading: certsLoading } = useGetCertificates();

  // Settings states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [useCustomUrl, setUseCustomUrl] = useState(false);

  // Active Certificate Modal
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  // Load initial settings
  useEffect(() => {
    if (user) {
      const names = user.display_name?.split(" ") || [];
      setFirstName(names[0] || "");
      setLastName(names.slice(1).join(" ") || "");

      const url = user.photo_url || "";
      if (isEmoji(url)) {
        setSelectedAvatar(url);
        setCustomPhotoUrl("");
        setUseCustomUrl(false);
      } else {
        setSelectedAvatar("");
        setCustomPhotoUrl(url);
        setUseCustomUrl(!!url);
      }
    }
  }, [user]);

  if (!user) return null;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDisplayName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const finalPhotoUrl = useCustomUrl ? customPhotoUrl.trim() || null : selectedAvatar || null;

    updateProfile({
      displayName: finalDisplayName,
      photoUrl: finalPhotoUrl
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 print:hidden max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Account Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
            Manage your credentials and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 items-start">
          {/* Settings Section (Left 3 columns) */}
          <div className="lg:col-span-3 bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-4 lg:p-6 lg:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-xl">
                <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">Profile Details</h3>
                <p className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 tracking-wider">Configure display name and avatar</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="Enter first name"
                    className="w-full pl-4 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-xl focus:outline-none focus:border-neutral-450 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-black transition-all text-xs font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Enter last name"
                    className="w-full pl-4 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-xl focus:outline-none focus:border-neutral-450 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-black transition-all text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Avatar section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Choose Profile Picture</span>
                  <button
                    type="button"
                    onClick={() => setUseCustomUrl(!useCustomUrl)}
                    className="text-[10px] font-black uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{useCustomUrl ? "Use preset avatar" : "Use custom image URL"}</span>
                  </button>
                </div>

                {!useCustomUrl ? (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {PRESET_AVATARS.map((av) => {
                      const isSelected = selectedAvatar === av.emoji;
                      return (
                        <button
                          key={av.label}
                          type="button"
                          onClick={() => setSelectedAvatar(av.emoji)}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all hover:scale-105 cursor-pointer ${isSelected
                            ? "border-[#A3D14B] bg-[#A3D14B]/10 dark:bg-[#A3D14B]/5 scale-105 shadow-xs"
                            : "border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-800"
                            }`}
                          title={av.label}
                        >
                          <span className="select-none">{av.emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Custom Photo URL</label>
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                      className="w-full pl-4 pr-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-white/5 rounded-xl focus:outline-none focus:border-neutral-450 dark:focus:border-neutral-700 focus:bg-white dark:focus:bg-black transition-all text-xs font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-2"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Credentials Section (Right 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-950 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 rounded-xl">
                  <Award className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">Graduation Credentials</h3>
                  <p className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 tracking-wider">Your official course certificates</p>
                </div>
              </div>

              {certsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#A3D14B] animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-450 mt-3 animate-pulse">Syncing certificates...</p>
                </div>
              ) : certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="p-4 bg-neutral-50 dark:bg-neutral-900/40 border border-black/5 dark:border-white/5 rounded-xl space-y-3 relative overflow-hidden group hover:border-neutral-300 dark:hover:border-neutral-800 transition-all"
                    >
                      {/* Stylized Badge behind details */}
                      <Award className="w-16 h-16 text-neutral-200/40 dark:text-neutral-850/40 absolute -right-2 -bottom-2 transform rotate-12 transition-transform group-hover:scale-110" />

                      <div className="space-y-1 pr-6">
                        <h4 className="text-xs font-black text-neutral-900 dark:text-white leading-tight">
                          {cert.course_title}
                        </h4>
                        <p className="text-[10px] text-neutral-450 font-bold uppercase tracking-wider">
                          Issued {new Date(cert.issued_at * 1000).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveCert(cert)}
                        className="w-full py-2 bg-white dark:bg-black text-neutral-900 dark:text-neutral-150 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        View Certificate
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  <Award className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2 stroke-1" />
                  <h4 className="text-xs font-extrabold text-neutral-700 dark:text-neutral-300">No Credentials Yet</h4>
                  <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-widest mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Complete all modules and pass final quizzes to unlock graduation certificates!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Certificate Frame (Overlay Modal) */}
      <AnimatePresence>
        {activeCert && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
            {/* Background click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveCert(null)} />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-4xl relative z-10 p-6 sm:p-8 space-y-6 shadow-2xl print:p-0 print:border-0 print:shadow-none"
            >
              {/* Modal Controls (Hidden when printing) */}
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 print:hidden">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-450">Official Certificate</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#A3D14B] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    onClick={() => setActiveCert(null)}
                    className="p-1.5 rounded-lg border border-black/5 dark:border-white/5 text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Certificate Diploma Design Frame */}
              <div
                id="certificate-print-area"
                className="border-8 border-double border-neutral-250 dark:border-neutral-800 p-6 sm:p-12 relative text-center bg-white dark:bg-neutral-950 font-serif text-neutral-900 dark:text-neutral-100 min-h-[500px] flex flex-col justify-between overflow-hidden print:border-neutral-900 print:text-black print:bg-white"
              >
                {/* Vintage Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-neutral-400 dark:border-neutral-700 print:border-black" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-neutral-400 dark:border-neutral-700 print:border-black" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-neutral-400 dark:border-neutral-700 print:border-black" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-neutral-400 dark:border-neutral-700 print:border-black" />

                {/* Header Badge */}
                <div className="flex flex-col items-center gap-1.5 pt-4">
                  <Award className="w-16 h-16 text-[#A3D14B] stroke-1 drop-shadow-sm print:text-black" />
                  <span className="font-sans text-[10px] font-black uppercase tracking-widest text-[#A3D14B] dark:text-[#A3D14B] print:text-black">
                    dbcolorsNG Academy
                  </span>
                </div>

                {/* Body Content */}
                <div className="space-y-6 my-6 sm:my-8">
                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wide uppercase text-neutral-850 dark:text-neutral-100 print:text-black font-sans">
                    Certificate of Completion
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 italic dark:text-neutral-400 print:text-neutral-600">
                    This is to officially certify that
                  </p>
                  <h3 className="text-xl sm:text-3xl font-black underline decoration-1 underline-offset-8 text-neutral-900 dark:text-white print:text-black font-sans">
                    {activeCert.user_display_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 italic dark:text-neutral-400 print:text-neutral-600">
                    has successfully met the academic criteria and completed all requirements for
                  </p>
                  <h4 className="text-lg sm:text-2xl font-black text-[#A3D14B] dark:text-[#A3D14B] print:text-black font-sans">
                    {activeCert.course_title}
                  </h4>
                </div>

                {/* Footer details & Signatures */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-100 dark:border-neutral-900 print:border-neutral-200 text-left items-end">
                  {/* Left Column: Date & ID */}
                  <div className="space-y-1 font-sans">
                    <p className="text-[9px] font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Date of Graduation</p>
                    <p className="text-[11px] font-extrabold text-neutral-800 dark:text-neutral-200 print:text-black">
                      {new Date(activeCert.issued_at * 1000).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                    <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest pt-1">
                      VERIFICATION CODE: {activeCert.verification_code}
                    </p>
                  </div>

                  {/* Center Column: Stamp Seal */}
                  <div className="flex justify-center print:opacity-100">
                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#A3D14B]/30 dark:border-[#A3D14B]/10 flex items-center justify-center transform rotate-12 print:border-black/20">
                      <div className="w-12 h-12 rounded-full bg-[#A3D14B]/10 dark:bg-[#A3D14B]/5 flex items-center justify-center text-[8px] font-black text-center uppercase text-[#A3D14B] tracking-wider leading-none print:text-black print:bg-neutral-100">
                        OFFICIAL VERIFIED
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Signature line */}
                  <div className="space-y-1 text-right font-sans">
                    <div className="h-6 flex items-end justify-end mb-1">
                      {/* Mock signature vector graphic */}
                      <span className="font-serif italic text-sm text-neutral-600 dark:text-neutral-400 print:text-black transform -rotate-3 select-none">
                        dbcolorsNG Team
                      </span>
                    </div>
                    <div className="border-t border-neutral-200 dark:border-neutral-800 print:border-black/30 pt-1">
                      <p className="text-[9px] font-black uppercase tracking-wider text-neutral-450 dark:text-neutral-500">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS to override display for printable areas */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-print-area, #certificate-print-area * {
            visibility: visible;
          }
          #certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border: 12px double #000 !important;
            padding: 40px !important;
            box-sizing: border-box;
            background: white !important;
            color: black !important;
          }
          /* Hide theme background overrides */
          html, body {
            background-color: white !important;
            color: black !important;
          }
        }
      `}} />
    </DashboardLayout>
  );
}
