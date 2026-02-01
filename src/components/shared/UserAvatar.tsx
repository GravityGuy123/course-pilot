"use client";

import React from "react";
import Image from "next/image";

interface UserInfo {
  full_name: string;
  username: string;
  avatar?: string | null;
}

interface UserAvatarProps {
  user: UserInfo;
  size?: 24 | 32 | 40 | 48 | 80;
  className?: string;
}

export default function UserAvatar({
  user,
  size = 24,
  className = "",
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

  const sizeClassMap: Record<number, string> = {
    24: "w-6 h-6 text-xs",
    32: "w-8 h-8 text-sm",
    40: "w-10 h-10 text-base",
    48: "w-12 h-12 text-lg",
    80: "w-20 h-20 text-2xl",
  };

  const sizeClasses = sizeClassMap[size];

  const avatarUrl =
    user.avatar && user.avatar !== ""
      ? user.avatar.startsWith("http")
        ? user.avatar
        : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "")}/${user.avatar.replace(
            /^\/?/,
            ""
          )}`
      : null;

  if (avatarUrl) {
    return (
      <div
        className={`rounded-full overflow-hidden ${sizeClasses} ${className}`}
      >
        <Image
          src={avatarUrl}
          alt={user.username}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          unoptimized
        />
      </div>
    );
  }

  const isFill =
    className.split(" ").includes("w-full") ||
    className.split(" ").includes("h-full");

  const baseSizeClasses = isFill ? "w-full h-full" : sizeClasses;

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