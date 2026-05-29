import { LMSProfile, Enrollment, Announcement, Certificate } from "../entities/LMS";

export interface LmsRepository {
  getProfile(): Promise<LMSProfile>;
  getLeaderboard(limit?: number): Promise<LMSProfile[]>;
  getEnrollments(): Promise<Enrollment[]>;
  getAnnouncements(): Promise<Announcement[]>;
  getCertificates(): Promise<Certificate[]>;
}
