import { ReactNode } from "react";
import type { Metadata } from "next";
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
import RightSidebar from "@/components/shared/RightSidebar";
import AppToaster from "@/components/shared/AppToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoursePilot - Your Digital Learning Hub",
  description:
    "CoursePilot is a comprehensive digital learning platform offering online courses, tutorials, and mentorship programs to help you acquire new skills anytime, anywhere.",

  // Standard meta tags
  keywords: [
    "E-Learning",
    "Online Courses",
    "Digital Learning",
    "Skill Development",
    "Mentorship",
    "CoursePilot",
    "Tutorials",
    "Education Platform",
    "Learning Online",
  ],
  authors: [{ name: "CoursePilot Team", url: "https://course-pilot.com" }],
  creator: "CoursePilot Team",
  publisher: "CoursePilot Inc.",
  applicationName: "CoursePilot",
  category: "Education",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },

  // Verification tags
  verification: {
    google: "google-site-verification-code",
  },

  // Open Graph / Facebook
  openGraph: {
    title: "CoursePilot - Your Digital Learning Hub",
    description:
      "Learn anytime, anywhere with online courses, tutorials, and mentorship programs from CoursePilot.",
    url: "https://course-pilot.com",
    siteName: "CoursePilot",
    type: "website",
    images: [
      {
        url: "https://course-pilot.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoursePilot Platform Preview",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "CoursePilot - Your Digital Learning Hub",
    description:
      "Learn anytime, anywhere with online courses, tutorials, and mentorship programs from CoursePilot.",
    creator: "@CoursePilot",
    images: ["https://course-pilot.com/twitter-card.png"],
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Language
  alternates: {
    canonical: "https://course-pilot.com",
    languages: {
      "en-US": "https://course-pilot.com",
      "fr-FR": "https://course-pilot.com/fr",
      "es-ES": "https://course-pilot.com/es",
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <ThemeProvider attribute="class">
          <AuthProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                {/* Left Sidebar */}
                <aside className="hidden md:block md:fixed md:top-0 md:left-0 md:h-screen md:w-[260px] bg-gray-100 dark:bg-gray-850 md:shadow-lg md:z-30 md:overflow-y-auto">
                  <AppSidebar />
                </aside>

                {/* Main Content */}
                <div className="flex flex-col flex-1 w-full md:ml-[260px] min-w-0">
                  <div className="bg-gray-50 dark:bg-gray-900 w-full sticky top-0 z-50 shadow px-6 mt-4">
                    <Header />
                  </div>

                  <div className="flex flex-col lg:flex-row flex-1 min-w-0">
                    <main className="flex-1 px-6 py-8 lg:pr-8">{children}</main>
                    {/* Only render sidebar if user is logged in */}
                    {/* <RightSidebar /> */}
                  </div>

                  <footer className="w-full px-6">
                    <Footer />
                  </footer>
                </div>
              </div>
              <Toaster toastOptions={{ duration: 3000 }} />
              {/* <AppToaster />  */}
              <Analytics />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
