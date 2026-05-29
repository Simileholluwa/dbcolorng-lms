import { useQuery } from "@tanstack/react-query";
import { HttpLmsRepository } from "@/infrastructure/repositories/HttpLmsRepository";

const lmsRepository = new HttpLmsRepository();

export const useLms = () => {
  const useGetProfile = () => {
    return useQuery({
      queryKey: ["lms-profile"],
      queryFn: () => lmsRepository.getProfile(),
    });
  };

  const useGetLeaderboard = (limit?: number) => {
    return useQuery({
      queryKey: ["lms-leaderboard", limit],
      queryFn: () => lmsRepository.getLeaderboard(limit),
    });
  };

  const useGetEnrollments = () => {
    return useQuery({
      queryKey: ["lms-enrollments"],
      queryFn: () => lmsRepository.getEnrollments(),
    });
  };

  const useGetAnnouncements = () => {
    return useQuery({
      queryKey: ["lms-announcements"],
      queryFn: () => lmsRepository.getAnnouncements(),
    });
  };

  const useGetCertificates = () => {
    return useQuery({
      queryKey: ["lms-certificates"],
      queryFn: () => lmsRepository.getCertificates(),
    });
  };

  return {
    useGetProfile,
    useGetLeaderboard,
    useGetEnrollments,
    useGetAnnouncements,
    useGetCertificates,
  };
};
