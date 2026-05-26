"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useLms } from "@/presentation/hooks/useLms";
import {
  Trophy,
  Crown,
  Zap,
  Award,
  Search,
  ChevronRight,
  TrendingUp,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  Star
} from "lucide-react";

interface BadgeConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  description: string;
}

const getBadgeConfig = (badgeName: string): BadgeConfig => {
  const normalized = badgeName.toLowerCase();
  if (normalized.includes("first") || normalized.includes("welcome") || normalized.includes("steps")) {
    return {
      name: badgeName,
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
      color: "text-amber-500",
      borderColor: "border-amber-500/30 dark:border-amber-500/20",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/5",
      description: "Enrolled in your first course!"
    };
  }
  if (normalized.includes("quick") || normalized.includes("fast") || normalized.includes("speed") || normalized.includes("learner")) {
    return {
      name: badgeName,
      icon: <Zap className="w-3.5 h-3.5 text-primary" />,
      color: "text-primary",
      borderColor: "border-primary/30 dark:border-primary/20",
      bgColor: "bg-primary/10 dark:bg-primary/5",
      description: "Demonstrated rapid lesson completion!"
    };
  }
  if (normalized.includes("guru") || normalized.includes("master") || normalized.includes("expert") || normalized.includes("champion")) {
    return {
      name: badgeName,
      icon: <Trophy className="w-3.5 h-3.5 text-purple-500" />,
      color: "text-purple-500",
      borderColor: "border-purple-500/30 dark:border-purple-500/20",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/5",
      description: "Achieved top marks or course completion!"
    };
  }
  // Default fallback
  return {
    name: badgeName,
    icon: <Award className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />,
    color: "text-neutral-500 dark:text-neutral-400",
    borderColor: "border-neutral-500/30 dark:border-neutral-500/20",
    bgColor: "bg-neutral-500/10 dark:bg-neutral-500/5",
    description: "Achievement unlocked!"
  };
};

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const { useGetProfile, useGetLeaderboard } = useLms();

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile
  } = useGetProfile();

  const {
    data: leaderboard = [],
    isLoading: isLeaderboardLoading,
    isError: isLeaderboardError,
    refetch: refetchLeaderboard
  } = useGetLeaderboard(50);

  const [searchQuery, setSearchQuery] = useState("");

  const handleRetry = () => {
    refetchProfile();
    refetchLeaderboard();
  };

  // Find user's current rank from the leaderboard
  const currentUserRankIndex = leaderboard.findIndex(item => item.user_id === user?.id);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : null;

  // Filter rankings list for search
  const filteredLeaderboard = leaderboard.filter(item =>
    item.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Divide the leaderboard into top-3 podium and remaining list items
  const topThree = leaderboard.slice(0, 3);
  const podiumOrder = [
    topThree[1], // 2nd Place (Left)
    topThree[0], // 1st Place (Center)
    topThree[2], // 3rd Place (Right)
  ].filter(Boolean);

  const remainingRankings = filteredLeaderboard.slice(3);

  // XP & Level calculations
  const totalXp = profile?.total_xp ?? 0;
  const currentLevel = profile?.level ?? 1;
  const xpInCurrentLevel = totalXp % 100;
  const progressToNextLevel = xpInCurrentLevel;
  const xpNeededForNextLevel = 100 - xpInCurrentLevel;

  const isAnyLoading = isProfileLoading || isLeaderboardLoading;
  const isAnyError = isProfileError || isLeaderboardError;

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-8 animate-fade-in">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Leaderboard Rankings
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
              Compete with fellow designers, complete course challenges, and claim the top podium spot.
            </p>
          </div>

          {!isAnyLoading && !isAnyError && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-450 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Rankings
            </button>
          )}
        </div>

        {/* Header Navigation & Title */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
              Leaderboard Rankings
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-medium">
              Compete with fellow designers, complete course challenges, and claim the top podium spot.
            </p>
          </div>

          {!isAnyLoading && !isAnyError && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 self-start sm:self-center px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-450 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Rankings
            </button>
          )}
        </div> */}

        {/* Error State View */}
        {isAnyError && (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/5 rounded-2xl border border-red-500/10 text-red-500 max-w-md mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 stroke-1" />
            <h3 className="font-extrabold text-lg">Failed to sync rankings</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We encountered a connection issue fetching the class leaderboard. Make sure the backend service is running.
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetching
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isAnyLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800/80 animate-pulse" />
              ))}
            </div>
            <div className="h-96 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800/80 animate-pulse" />
          </div>
        )}

        {!isAnyLoading && !isAnyError && (
          <>
            {/* Podium Component Section */}
            {topThree.length > 0 && (
              <div className="p-6 md:p-8 bg-white dark:bg-neutral-900/20 border border-neutral-200/60 dark:border-neutral-800/80 shadow-xs rounded-2xl space-y-6">
                <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-450 dark:text-neutral-400 text-center flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500 fill-amber-500/10" /> Global Top 3 Podiums
                </h2>

                <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-12 max-w-xl mx-auto items-end">
                  {podiumOrder.map((player) => {
                    const originalIndex = leaderboard.findIndex(item => item.user_id === player.user_id);
                    const rank = originalIndex + 1;
                    const isSelf = player.user_id === user?.id;

                    // Rank-specific decoration styling
                    let rankLabel = "";
                    let medalColor = "";
                    let pedestalHeight = "";
                    let pedestalGradient = "";
                    let crownElement = null;

                    if (rank === 1) {
                      rankLabel = "1st Place";
                      medalColor = "bg-amber-500 text-black";
                      pedestalHeight = "h-36 sm:h-44";
                      pedestalGradient = "bg-gradient-to-t from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20";
                      crownElement = (
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-500"
                        >
                          <Crown className="w-6 h-6 fill-amber-500/20" />
                        </motion.div>
                      );
                    } else if (rank === 2) {
                      rankLabel = "2nd Place";
                      medalColor = "bg-neutral-400 text-black";
                      pedestalHeight = "h-24 sm:h-32";
                      pedestalGradient = "bg-gradient-to-t from-neutral-400/15 via-neutral-400/5 to-transparent border-neutral-400/10";
                    } else {
                      rankLabel = "3rd Place";
                      medalColor = "bg-amber-700 text-white";
                      pedestalHeight = "h-16 sm:h-24";
                      pedestalGradient = "bg-gradient-to-t from-amber-700/15 via-amber-700/5 to-transparent border-amber-700/10";
                    }

                    const initials = player.display_name
                      ? player.display_name.split(" ").map(n => n[0]).slice(0, 2).join("")
                      : "AL";

                    return (
                      <div key={player.user_id} className="flex flex-col items-center relative text-center min-w-0">
                        {/* Avatar bubble */}
                        <div className="relative mb-2">
                          {crownElement}
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 ${isSelf ? 'border-primary shadow-xs shadow-primary/20' : 'border-neutral-200 dark:border-neutral-700'}`}>
                            {player.photo_url ? (
                              <Image
                                src={player.photo_url}
                                alt={player.display_name || ""}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-300 uppercase">
                                {initials}
                              </span>
                            )}
                          </div>
                          {/* Rank Pill overlay */}
                          <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border border-white dark:border-neutral-900 ${medalColor}`}>
                            {rank}
                          </span>
                        </div>

                        {/* Text info */}
                        <div className="w-full space-y-0.5 mb-2 px-1">
                          <p className={`text-xs sm:text-sm font-extrabold truncate ${isSelf ? 'text-primary' : 'text-neutral-900 dark:text-neutral-100'}`}>
                            {player.display_name || "Learner"}
                          </p>
                          <p className="text-[9px] sm:text-[10px] font-bold text-neutral-400">Level {player.level}</p>
                        </div>

                        {/* Physical pedestal bar */}
                        <div className={`w-full ${pedestalHeight} rounded-t-xl border-t border-x ${pedestalGradient} flex flex-col justify-end p-2 sm:p-3`}>
                          <span className="text-[10px] font-black uppercase text-neutral-450 dark:text-neutral-500 tracking-wider">XP</span>
                          <span className="text-xs sm:text-sm font-black text-neutral-800 dark:text-neutral-200">{player.total_xp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* rankings filter and table list */}
            <div className="bg-white dark:bg-neutral-900/20 border border-neutral-200/60 dark:border-neutral-800/80 shadow-xs rounded-2xl overflow-hidden">

              {/* Table search filter bar */}
              <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                    Leaderboard Standings
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                    Showing top active learners with complete XP indexes.
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search learners by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Scrollable list/table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200/50 dark:border-neutral-800">
                      <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">Rank</th>
                      <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">Learner</th>
                      <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 text-center">Level</th>
                      <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 text-center">Lessons</th>
                      <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">Unlocked Badges</th>
                      <th className="px-6 py-4.5 text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 text-right">Total XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render visual entries */}
                    {filteredLeaderboard.length > 0 ? (
                      filteredLeaderboard.map((item, index) => {
                        const rank = index + 1;
                        const isSelf = item.user_id === user?.id;

                        const initials = item.display_name
                          ? item.display_name.split(" ").map(n => n[0]).slice(0, 2).join("")
                          : "AL";

                        return (
                          <tr
                            key={item.user_id}
                            className={`border-b border-neutral-100/50 dark:border-neutral-900/50 transition-colors text-sm hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 ${isSelf ? 'bg-primary/5 dark:bg-primary/5 font-medium' : ''}`}
                          >
                            {/* Rank Column */}
                            <td className="px-6 py-4 font-black text-neutral-500 dark:text-neutral-400">
                              {rank <= 3 ? (
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${rank === 1 ? 'bg-amber-500 text-black' :
                                  rank === 2 ? 'bg-neutral-400 text-black' :
                                    'bg-amber-700 text-white'
                                  }`}>
                                  {rank}
                                </span>
                              ) : (
                                <span>#{rank}</span>
                              )}
                            </td>

                            {/* Learner Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-xs font-bold text-neutral-600 dark:text-neutral-450 shrink-0 ${isSelf ? 'border-primary' : 'border-neutral-200 dark:border-neutral-800'}`}>
                                  {item.photo_url ? (
                                    <Image
                                      src={item.photo_url}
                                      alt={item.display_name || ""}
                                      width={32}
                                      height={32}
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span>{initials}</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className={`font-bold block truncate ${isSelf ? 'text-primary' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                    {item.display_name || "Learner"}
                                    {isSelf && (
                                      <span className="ml-1.5 text-[8px] bg-indigo-500/10 border border-indigo-500/20 font-black uppercase tracking-widest px-1 py-0.5 rounded-full text-black">
                                        You
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Level */}
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Lvl {item.level}
                              </span>
                            </td>

                            {/* Completed Lessons */}
                            <td className="px-6 py-4 text-center font-bold text-neutral-700 dark:text-neutral-350">
                              {item.completed_lessons_count}
                            </td>

                            {/* Badges list */}
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1.5">
                                {item.badges && item.badges.length > 0 ? (
                                  item.badges.slice(0, 3).map((badge, idx) => {
                                    const cfg = getBadgeConfig(badge);
                                    return (
                                      <span
                                        key={idx}
                                        title={cfg.description}
                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.borderColor} ${cfg.bgColor}`}
                                      >
                                        {cfg.icon}
                                        {cfg.name}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-[10px] text-neutral-400 font-medium">None</span>
                                )}
                                {item.badges && item.badges.length > 3 && (
                                  <span className="text-[10px] font-extrabold text-neutral-400 px-1 py-0.5">
                                    +{item.badges.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* XP */}
                            <td className="px-6 py-4 text-right font-black text-neutral-900 dark:text-white flex items-center justify-end gap-1">
                              <Zap className="w-3.5 h-3.5 text-primary fill-primary/10" />
                              <span>{item.total_xp}</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest text-xs">
                          No matching records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
