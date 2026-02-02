// src/components/shared/UserAvatar.tsx
"use client";

import React, { useMemo } from "react";
import Image from "next/image";

interface UserInfo {
  full_name: string;
  username: string;
  avatar?: string | null;
}

type AvatarSize =
  | 16
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40
  | 44
  | 48
  | 56
  | 64
  | 72
  | 80
  | 96
  | 112
  | 128;

interface UserAvatarProps {
  user: UserInfo;
  size?: AvatarSize;
  className?: string;
  priority?: boolean;
}

export default function UserAvatar({
  user,
  size = 24,
  className = "",
  priority = false,
}: UserAvatarProps) {
  const getInitials = (fullName: string) =>
    fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const getColorClass = (name: string) => {
    const colors = [
      "bg-blue-500 dark:bg-blue-600",
      "bg-green-500 dark:bg-green-600",
      "bg-red-500 dark:bg-red-600",
      "bg-purple-500 dark:bg-purple-600",
      "bg-yellow-500 dark:bg-yellow-600",
      "bg-pink-500 dark:bg-pink-600",
    ];
    const hash = Array.from(name).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    return colors[hash % colors.length];
  };

  // Production-grade: predictable sizes for layout + consistent typography scaling.
  const sizeClassMap: Record<AvatarSize, string> = {
    16: "w-4 h-4 text-[10px]",
    20: "w-5 h-5 text-[11px]",
    24: "w-6 h-6 text-xs",
    28: "w-7 h-7 text-[13px]",
    32: "w-8 h-8 text-sm",
    36: "w-9 h-9 text-[15px]",
    40: "w-10 h-10 text-base",
    44: "w-11 h-11 text-[17px]",
    48: "w-12 h-12 text-lg",
    56: "w-14 h-14 text-xl",
    64: "w-16 h-16 text-2xl",
    72: "w-18 h-18 text-[28px]",
    80: "w-20 h-20 text-3xl",
    96: "w-24 h-24 text-4xl",
    112: "w-28 h-28 text-[44px]",
    128: "w-32 h-32 text-[52px]",
  };

  const sizeClasses = sizeClassMap[size];

  // Keep your existing regex EXACTLY as-is (per your constraint).
  const avatarUrl =
    user.avatar && user.avatar !== ""
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "")}/${user.avatar.replace(
            /^\/?/,
            ""
          )}`
      : null;

  const classTokens = useMemo(() => className.split(" ").filter(Boolean), [className]);

  // If caller wants to control exact sizing via className (w-full/h-full), respect it.
  const isFill = useMemo(() => {
    const set = new Set(classTokens);
    return set.has("w-full") || set.has("h-full");
  }, [classTokens]);

  const baseSizeClasses = isFill ? "w-full h-full" : sizeClasses;

  if (avatarUrl) {
    return (
      <div className={`rounded-full overflow-hidden ${baseSizeClasses} ${className}`}>
        <Image
          src={avatarUrl}
          alt={user.username}
          width={size}
          height={size}
          sizes={`${size}px`}
          className="object-cover w-full h-full"
          unoptimized
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div
      aria-label={user.full_name}
      className={`rounded-full ${baseSizeClasses} text-white font-semibold flex items-center justify-center ${getColorClass(
        user.full_name
      )} ${className}`}
    >
      {getInitials(user.full_name)}
    </div>
  );
}