import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://lms.dbcolorsng.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/register", "/forgot-password"],
        disallow: [
          "/dashboard",
          "/home",
          "/leaderboard",
          "/profile",
          "/reset-password",
          "/verify-email-sent",
          "/verify-success",
          "/verify-error",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
