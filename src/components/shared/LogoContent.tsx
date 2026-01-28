"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LogoContent() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const lightLogoSrc = "/logo_1.png";
  const darkLogoSrc = "/logo_2.png";

  if (!mounted) return null; // prevent SSR mismatch

  const logoSrc = theme === "dark" ? darkLogoSrc : lightLogoSrc;

  return (
    <section className="flex items-center gap-2 mt-4 mb-6 px-3">
      <Image
        src={logoSrc}
        alt="CoursePilot Logo"
        width={36}
        height={36}
        className="rounded-md"
        priority
      />
      <span className="text-2xl uppercase font-bold text-violet-400 dark:text-indigo-200">
        Course-Pilot
      </span>
    </section>
  );
}
