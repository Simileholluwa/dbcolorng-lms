"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/presentation/components/DashboardLayout";
import Loader from "@/presentation/components/ui/Loader";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useLms } from "@/presentation/hooks/useLms";
import {
  BookOpen,
  Award,
  Zap,
  Sparkles,
  Megaphone,
  CheckCircle,
  Trophy,
  Play,
  ArrowRight,
  Star,
  AlertCircle,
  Pin,
  RefreshCw,
  Crown
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
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      color: "text-amber-500",
      borderColor: "border-amber-500/30 dark:border-amber-500/20",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/5",
      description: "Enrolled in your first course!"
    };
  }
  if (normalized.includes("quick") || normalized.includes("fast") || normalized.includes("speed") || normalized.includes("learner")) {
    return {
      name: badgeName,
      icon: <Zap className="w-5 h-5 text-primary" />,
      color: "text-primary",
      borderColor: "border-primary/30 dark:border-primary/20",
      bgColor: "bg-primary/10 dark:bg-primary/5",
      description: "Demonstrated rapid lesson completion!"
    };
  }
  if (normalized.includes("guru") || normalized.includes("master") || normalized.includes("expert") || normalized.includes("champion")) {
    return {
      name: badgeName,
      icon: <Trophy className="w-5 h-5 text-purple-500" />,
      color: "text-purple-500",
      borderColor: "border-purple-500/30 dark:border-purple-500/20",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/5",
      description: "Achieved top marks or course completion!"
    };
  }
  // Default fallback
  return {
    name: badgeName,
    icon: <Award className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />,
    color: "text-neutral-500 dark:text-neutral-400",
    borderColor: "border-neutral-500/30 dark:border-neutral-500/20",
    bgColor: "bg-neutral-500/10 dark:bg-neutral-500/5",
    description: "Achievement unlocked!"
  };
};

export default function HomePage() {
  const { user } = useAuthStore();
  const {
    useGetProfile,
    useGetLeaderboard,
    useGetEnrollments,
    useGetAnnouncements
  } = useLms();

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile
  } = useGetProfile();

  const {
    data: leaderboard,
    isLoading: isLeaderboardLoading,
    isError: isLeaderboardError,
    refetch: refetchLeaderboard
  } = useGetLeaderboard(5);

  const {
    data: enrollments,
    isLoading: isEnrollmentsLoading,
    isError: isEnrollmentsError,
    refetch: refetchEnrollments
  } = useGetEnrollments();

  const {
    data: announcements,
    isLoading: isAnnouncementsLoading,
    isError: isAnnouncementsError,
    refetch: refetchAnnouncements
  } = useGetAnnouncements();

  // Track expanded state for announcements
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Record<string, boolean>>({});

  const toggleAnnouncement = (id: string) => {
    setExpandedAnnouncements((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRetryAll = () => {
    refetchProfile();
    refetchLeaderboard();
    refetchEnrollments();
    refetchAnnouncements();
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 0) return "just now";
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  // XP & Level calculations
  const totalXp = profile?.total_xp ?? 0;
  const currentLevel = Math.max(profile?.level ?? 1, Math.floor(totalXp / 100) + 1);
  const xpInCurrentLevel = totalXp % 100;
  const progressToNextLevel = xpInCurrentLevel;
  const xpNeededForNextLevel = 100 - xpInCurrentLevel;

  const hasAnyError = isProfileError || isLeaderboardError || isEnrollmentsError || isAnnouncementsError;
  const isAnyLoading = isProfileLoading || isLeaderboardLoading || isEnrollmentsLoading || isAnnouncementsLoading;

  if (isAnyLoading) {
    return (
      <DashboardLayout>
        <Loader fullScreen size={120} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Error State Banner */}
        {hasAnyError && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Some dashboard feeds failed to load. Please verify your connection.</p>
            </div>
            <button
              onClick={handleRetryAll}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Now
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">

          {/* Left Column (Stats & Enrollments) */}
          <div className="xl:col-span-2 space-y-4 md:space-y-8">

            {/* Welcome & XP Stats Card */}
            {profile ? (
              <div className="relative overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-900 text-white p-6 lg:p-8">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-md">
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                      Welcome back, <span className="text-primary">{user?.display_name || "Learner"}</span>!
                    </h1>
                    <p className="text-sm text-neutral-400">
                      Ready to level up your interior design skills today? Complete your current lessons to earn XP and climb the leaderboard!
                    </p>
                  </div>

                  {/* Level Status & Progress */}
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/5 w-full md:w-72 flex-shrink-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Level</p>
                        <h3 className="text-3xl font-black text-primary">{currentLevel}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Total XP</p>
                        <h3 className="text-xl font-bold text-white">{totalXp.toLocaleString()} XP</h3>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-neutral-400">
                        <span>{progressToNextLevel}%</span>
                        <span>{xpNeededForNextLevel} XP to Level {currentLevel + 1}</span>
                      </div>
                      <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full animate-pulse rounded-full transition-all duration-1000 relative"
                          style={{
                            width: `${progressToNextLevel}%`,
                            backgroundImage: "linear-gradient(to right, #A3D14B, #34D399)"
                          }}
                        >
                          <div className="absolute inset-0 bg-white/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Counter Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative">
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 font-medium">Courses Enrolled</p>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{profile.enrolled_courses_count}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 font-medium">Lessons Completed</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{profile.completed_lessons_count}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 font-medium">Rankings Spot</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">Top 5</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-neutral-500 font-medium">Earned Badges</p>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-lg font-bold">{profile.badges.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-neutral-400" />
                <h3 className="text-lg font-bold">LMS Profile Not Found</h3>
                <p className="text-sm text-neutral-500 max-w-sm">
                  We could not locate your LMS learning profile. Try enrolling in a course to initialize it.
                </p>
                <button
                  onClick={() => refetchProfile()}
                  className="px-4 py-2 bg-primary text-black font-bold rounded-xl transition-all cursor-pointer"
                >
                  Reload Profile
                </button>
              </div>
            )}

            {/* Badges Showcase */}
            {!isProfileLoading && profile && profile.badges.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Your Achievements
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {profile.badges.map((badge, idx) => {
                    const badgeConf = getBadgeConfig(badge);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3.5 p-4 rounded-xl border ${badgeConf.borderColor} ${badgeConf.bgColor} transition-transform hover:scale-[1.02] duration-300`}
                      >
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/80 shadow-sm">
                          {badgeConf.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{badgeConf.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{badgeConf.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue Learning Section */}
            <div className="space-y-4 pt-4 lg:pt-0">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  Continue Learning
                </h2>
              </div>

              {isEnrollmentsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex flex-col bg-white dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/80 rounded-xl overflow-hidden shadow-xs space-y-4 pb-5">
                      <div className="h-32 w-full bg-neutral-150 dark:bg-neutral-850" />
                      <div className="px-5 space-y-3 flex-1">
                        <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                        <div className="h-3 bg-neutral-150 dark:bg-neutral-900 rounded w-5/6" />
                        <div className="h-3 bg-neutral-150 dark:bg-neutral-900 rounded w-1/2" />
                      </div>
                      <div className="px-5 space-y-2">
                        <div className="flex justify-between">
                          <div className="h-3 w-24 bg-neutral-150 dark:bg-neutral-900 rounded" />
                          <div className="h-3 w-8 bg-neutral-200 dark:bg-neutral-850 rounded" />
                        </div>
                        <div className="w-full h-2 bg-neutral-150 dark:bg-neutral-850 rounded-full" />
                      </div>
                      <div className="px-5">
                        <div className="h-9 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : enrollments && enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.map((item) => {
                    const progressPercent = Math.min(Math.max(item.progress_percent, 0), 100);
                    return (
                      <div
                        key={item.id}
                        className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {/* Course Cover */}
                        <div className="relative h-32 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                          {item.course?.thumbnail_url ? (
                            <Image
                              src={item.course.thumbnail_url}
                              alt={item.course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900 to-neutral-950 flex items-center justify-center p-4">
                              {/* Glowing Abstract Design */}
                              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
                              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 dark:text-neutral-900 text-center">
                                {item.course?.category || "dbcolorsNG"}
                              </span>
                            </div>
                          )}
                          <span className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border border-white/5">
                            {item.course?.category}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex-1 flex flex-col space-y-4">
                          <div className="space-y-1.5 flex-1">
                            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors line-clamp-1">
                              {item.course?.title}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                              {item.course?.description}
                            </p>
                          </div>

                          {/* Progress Meter */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-neutral-400 dark:text-neutral-500 font-semibold">Course Progress</span>
                              <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
                            </div>
                            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                              <div
                                className="h-full animate-pulse rounded-full transition-all duration-700"
                                style={{
                                  width: `${progressPercent}%`,
                                  backgroundImage: "linear-gradient(to right, #A3D14B, #34D399)"
                                }}
                              />
                            </div>
                          </div>

                          {/* Action Button */}
                          <Link
                            href={`/courses/${item.course_id}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-neutral-950 hover:bg-black dark:bg-neutral-800/40 dark:hover:bg-primary/15 dark:hover:text-primary border border-black/10 dark:border-white/5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Resume learning
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center space-y-4">
                  <BookOpen className="w-10 h-10 text-neutral-400" />
                  <h3 className="font-bold text-neutral-800 dark:text-neutral-200">No enrolled courses</h3>
                  <p className="text-xs text-neutral-500 max-w-sm">
                    You haven't enrolled in any courses yet. Explore our selection of interior design and color theory courses to get started.
                  </p>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-primary text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-transform cursor-pointer"
                  >
                    Explore Courses
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Leaderboard & Announcements) */}
          <div className="space-y-4 md:space-y-8">

            {/* Leaderboard Preview */}
            <div className="bg-white dark:bg-neutral-900 border pb-6 border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl shadow-xs space-y-6">
              <div className="flex justify-between px-6 pt-4 items-center">
                <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
                  Top Learners
                </h2>
                <Link href="/leaderboard" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                  View all
                </Link>
              </div>

              {isLeaderboardLoading ? (
                <div className="space-y-3.5 px-6 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-neutral-850 flex-shrink-0" />
                        <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-805 flex-shrink-0" />
                        <div className="space-y-2 flex-1 max-w-[120px]">
                          <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                          <div className="h-2.5 bg-neutral-150 dark:bg-neutral-900 rounded w-2/3" />
                        </div>
                      </div>
                      <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3.5">
                  {leaderboard.map((item, index) => {
                    const isCurrentUser = item.user_id === user?.id;
                    const rank = index + 1;

                    // Gold/Silver/Bronze colors
                    const badgeColor =
                      rank === 1
                        ? "bg-amber-400/20 text-amber-500 border-amber-400/40"
                        : rank === 2
                          ? "bg-slate-400/20 text-slate-400 border-slate-400/40"
                          : rank === 3
                            ? "bg-amber-700/20 text-amber-800 border-amber-700/40"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200/30";

                    return (
                      <div
                        key={item.user_id}
                        className={`flex items-center justify-between ${index !== leaderboard.length - 1 ? 'pb-2.5' : ''} transition-all ${isCurrentUser
                          ? "px-6 text-[#A3D14B]"
                          : "px-6"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank Badge */}
                          <span
                            className={`w-6 h-6 rounded-lg border text-xs font-black flex items-center justify-center flex-shrink-0 ${badgeColor}`}
                          >
                            {rank}
                          </span>

                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-black/5 dark:border-white/5 bg-primary/20 font-bold flex items-center justify-center text-sm flex-shrink-0">
                            {item.photo_url ? (
                              <Image src={item.photo_url} alt={item.display_name || "Learner"} width={36} height={36} className="object-cover" />
                            ) : (
                              <span>{(item.display_name || "Learner")[0].toUpperCase()}</span>
                            )}
                          </div>

                          {/* Profile details */}
                          <div className="min-w-0">
                            <p className={`text-sm font-bold truncate ${isCurrentUser ? 'text-[#A3D14B]' : 'text-neutral-700 dark:text-neutral-300'}`}>
                              {item.display_name || "Anonymous Learner"}
                            </p>
                            <p className={`text-[10px] font-semibold ${isCurrentUser ? 'text-[#A3D14B]' : 'text-neutral-500'}`}>Level {Math.max(item.level ?? 1, Math.floor(item.total_xp / 100) + 1)}{isCurrentUser ? ' | You' : ''}</p>
                          </div>
                        </div>

                        {/* XP Pill */}
                        <span className={`text-xs font-black ${isCurrentUser ? 'text-[#A3D14B]' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {item.total_xp.toLocaleString()} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-neutral-500">No leaderboard logs yet.</div>
              )}
            </div>

            {/* Recent Announcements */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xs space-y-6">
              <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Recent Announcements
              </h2>

              {isAnnouncementsLoading ? (
                <div className="relative border-l border-neutral-200 dark:border-neutral-800 pl-4 ml-2 space-y-6 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative space-y-2">
                      <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900" />
                      <div className="space-y-2">
                        <div className="flex justify-between gap-4">
                          <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                          <div className="h-3 bg-neutral-150 dark:bg-neutral-900 rounded w-12" />
                        </div>
                        <div className="h-3 bg-neutral-150 dark:bg-neutral-900 rounded w-full" />
                        <div className="h-3 bg-neutral-150 dark:bg-neutral-900 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : announcements && announcements.length > 0 ? (
                <div className="relative border-l border-neutral-200 dark:border-neutral-800 pl-4 ml-2 space-y-6">
                  {announcements.map((item) => {
                    const isExpanded = !!expandedAnnouncements[item.id];
                    return (
                      <div key={item.id} className="relative group space-y-2">
                        {/* Timeline Node */}
                        <div
                          className={`absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-neutral-900 flex items-center justify-center transition-colors ${item.is_pinned
                            ? "border-primary bg-primary/20"
                            : "border-neutral-300 dark:border-neutral-700"
                            }`}
                        >
                          {item.is_pinned && <Pin className="w-2 h-2 text-primary" />}
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors flex items-center gap-1.5">
                              {item.title}
                              {item.is_pinned && (
                                <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1 bg-primary/10 text-primary border border-primary/25 rounded">
                                  Pinned
                                </span>
                              )}
                            </h3>
                            <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">
                              {formatTimeAgo(item.created_at)}
                            </span>
                          </div>

                          <p
                            className={`text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed transition-all ${isExpanded ? "" : "line-clamp-2"
                              }`}
                          >
                            {item.content}
                          </p>

                          {item.content.length > 100 && (
                            <button
                              onClick={() => toggleAnnouncement(item.id)}
                              className="text-[10px] font-extrabold uppercase tracking-wider text-primary hover:underline cursor-pointer pt-1 block"
                            >
                              {isExpanded ? "Collapse" : "Read Full"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-neutral-500 space-y-2">
                  <Megaphone className="w-8 h-8 mx-auto text-neutral-400 stroke-1" />
                  <p>All quiet. Check back later for announcements.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
