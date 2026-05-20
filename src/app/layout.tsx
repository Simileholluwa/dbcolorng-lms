import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/presentation/components/Providers";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://lms.dbcolors.ng";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "dbcolorsNG LMS | Empower Your Learning Journey",
    template: "%s | dbcolorsNG LMS",
  },
  description:
    "Learn interior design, project management, and space planning with dbcolorsNG LMS — Nigeria's premier platform for interior design education.",
  keywords: [
    "interior design",
    "colour theory",
    "space planning",
    "LMS",
    "learning management system",
    "Nigeria",
    "dbcolorsNG",
    "online learning",
    "design courses",
  ],
  authors: [{ name: "dbcolorsNG", url: siteUrl }],
  creator: "dbcolorsNG",
  publisher: "dbcolorsNG",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "dbcolorsNG LMS",
    title: "dbcolorsNG LMS | Empower Your Learning Journey",
    description:
      "Learn interior design, project management, and space planning with dbcolorsNG LMS — Nigeria's premier platform for interior design education.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "dbcolorsNG LMS — Empower Your Learning Journey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "dbcolorsNG LMS | Empower Your Learning Journey",
    description:
      "Learn interior design, project management, and space planning with dbcolorsNG LMS.",
    images: ["/opengraph-image.png"],
    creator: "@dbcolorsng",
    site: "@dbcolorsng",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col font-sans selection:bg-primary/30`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
