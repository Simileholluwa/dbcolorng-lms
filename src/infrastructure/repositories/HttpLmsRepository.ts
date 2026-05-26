import { LMSProfile, Enrollment, Announcement } from "../../domain/entities/LMS";
import { LmsRepository } from "../../domain/repositories/LmsRepository";
import apiClient from "../api/client";

export class HttpLmsRepository implements LmsRepository {
  async getProfile(): Promise<LMSProfile> {
    const response = await apiClient.get<LMSProfile>("/lms/me/profile");
    return response.data;
  }

  async getLeaderboard(limit: number = 10): Promise<LMSProfile[]> {
    const response = await apiClient.get<LMSProfile[]>(`/lms/leaderboard?limit=${limit}`);
    return response.data;
  }

  async getEnrollments(): Promise<Enrollment[]> {
    const response = await apiClient.get<Enrollment[]>("/lms/me/enrollments");
    return response.data;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const response = await apiClient.get<Announcement[]>("/lms/me/announcements");
    return response.data;
  }
}
