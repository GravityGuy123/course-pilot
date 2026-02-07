import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { AuthProvider } from "@/context/auth-context";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import { MobileSidebarProvider } from "@/context/mobile-sidebar-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// 🌍 Site URL (env-safe)
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://course-pilot.com").trim();

// 👤 AUTHOR IDENTITY (single source of truth)
const AUTHOR_NAME = "Ejidike Simon";
const AUTHOR_URL = SITE_URL; // personal site later if you want
const AUTHOR_TWITTER = "@GravityGuy123"; // optional

const AUTHOR_GITHUB = "https://github.com/GravityGuy123";
const AUTHOR_LINKEDIN = "https://www.linkedin.com/in/ejidike-simon"; // change if needed

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#4f46e5" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "CoursePilot – Learn Skills That Matter",
    template: "%s | CoursePilot",
  },

  description:
    "CoursePilot is a modern digital learning platform built by Ejidike Simon, offering structured online courses, mentorship, and skill-focused learning experiences.",

  applicationName: "CoursePilot",
  category: "Education",

  keywords: [
    "CoursePilot",
    "Online Learning Platform",
    "E-Learning",
    "Skill Development",
    "Mentorship",
    "Online Courses",
    "Learn Tech Skills",
    "Education Platform",
    "Ejidike Simon",
    "Ejidike Ifeanyi",
    "Ejidike Ifeanyi Simon",
    "Built by Ejidike Simon",
    "Built by Ejidike Ifeanyi",
    "Ejidike Simon GitHub",
    "Ejidike Ifeanyi GitHub",
  ],

  authors: [
    {
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
  ],

  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,

  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": SITE_URL,
      "fr-FR": `${SITE_URL}/fr`,
      "es-ES": `${SITE_URL}/es`,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

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
    title: "CoursePilot – Learn Skills That Matter",
    description:
      "A modern learning platform built by Ejidike Simon, designed to help learners gain real-world skills through courses and mentorship.",
    url: SITE_URL,
    siteName: "CoursePilot",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoursePilot learning platform preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CoursePilot – Learn Skills That Matter",
    description: "CoursePilot is a digital learning platform built by Ejidike Simon for skill-driven education.",
    images: ["/twitter-card.png"],
    creator: AUTHOR_TWITTER,
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: ["/favicon-16x16.png"],
  },

  manifest: "/site.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CoursePilot",
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    sameAs: [AUTHOR_GITHUB, AUTHOR_LINKEDIN].filter(Boolean),
    worksFor: {
      "@type": "Organization",
      name: "CoursePilot",
      url: SITE_URL,
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CoursePilot",
    url: SITE_URL,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/courses?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-dvh bg-gray-50 antialiased dark:bg-gray-900",
        ].join(" ")}
      >
        <Script
          id="person-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />

        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
          <AuthProvider>
            <SidebarProvider>
              <MobileSidebarProvider>
                <div className="flex min-h-dvh w-full">
                  {/* ✅ MUST be mounted always (mobile + desktop) */}
                  <AppSidebar />

                  {/* Main content */}
                  <div className="flex min-w-0 flex-1 flex-col md:ml-[260px]">
                    <div className="sticky top-0 z-50 bg-gray-50/80 px-3 pt-3 backdrop-blur dark:bg-gray-900/70 sm:px-6 sm:pt-4">
                      <Header />
                    </div>

                    <main className="flex-1 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
                      {children}
                    </main>

                    <footer className="px-3 pb-6 sm:px-6 lg:px-8">
                      <Footer />
                    </footer>
                  </div>
                </div>

                <Toaster toastOptions={{ duration: 3000 }} />
                <Analytics />
              </MobileSidebarProvider>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}