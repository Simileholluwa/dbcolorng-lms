import { LMSProfile, Enrollment, Announcement } from "../entities/LMS";

export interface LmsRepository {
  getProfile(): Promise<LMSProfile>;
  getLeaderboard(limit?: number): Promise<LMSProfile[]>;
  getEnrollments(): Promise<Enrollment[]>;
  getAnnouncements(): Promise<Announcement[]>;
}
