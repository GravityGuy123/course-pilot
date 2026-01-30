"use client";

import { useAuth } from "@/context/auth-context";
import StatisticsCard from "./StatisticsCard";
import MentorList from "./MentorList";

export default function RightSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-full lg:w-[320px] lg:shrink-0 bg-transparent order-first lg:order-last">
      <div className="px-6 py-8 lg:px-0 lg:pl-6 lg:pr-6 lg:sticky lg:top-[96px] lg:flex lg:flex-col lg:max-h-[calc(100vh-96px-64px)] lg:overflow-y-hidden lg:hover:overflow-y-auto lg:scrollbar-thin lg:scrollbar-track-transparent lg:scrollbar-thumb-gray-400 lg:hover:scrollbar-thumb-gray-500 transition-all">
        <StatisticsCard />
        <MentorList />
      </div>
    </aside>
  );
}
