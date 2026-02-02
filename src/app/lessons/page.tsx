// Page should not exist, delete later

"use client";

import React from "react";
import CategoryFilter from "@/components/others/CategoryFilter";
import CurrentLessonHighlight from "@/components/others/CurrentLessonHighlight";
import LessonsHeader from "@/components/lessons/LessonsHeader";
import LessonsList from "@/components/lessons/LessonsList";
import LessonsSearchFilter from "@/components/lessons/LessonsSearchFilter";
import ProgressOverview from "@/components/others/ProgressOverview";
import { LessonsPageLesson } from "@/lib/types";
import { ProtectedRoute } from "@/components/routing/RouteGuard";


// Lessons data
const lessons: LessonsPageLesson[] = [
  {
    id: 1,
    title: "Introduction to React Components",
    description: "Learn the fundamentals of React components and how to create reusable UI elements",
  instructor: "Leonardo Genial",
    duration: "45 min",
    difficulty: "Beginner",
    progress: 100,
    completed: true,
    rating: 4.9,
    thumbnail: "/woman1.jpg",
    category: "React Development",
  },
  {
    id: 2,
    title: "State Management with React Hooks",
    description: "Master useState, useEffect, and other React hooks for effective state management",
  instructor: "Leonardo Genial",
    duration: "1h 15min",
    difficulty: "Intermediate",
    progress: 65,
    completed: false,
    rating: 4.8,
    thumbnail: "/woman1.jpg",
    category: "React Development",
  },
  {
    id: 3,
    title: "Advanced UI/UX Design Principles",
    description: "Explore advanced design concepts, user psychology, and create stunning interfaces",
  instructor: "Raya Safitri",
    duration: "2h 30min",
    difficulty: "Advanced",
    progress: 30,
    completed: false,
    rating: 4.7,
    thumbnail: "/woman1.jpg",
    category: "UI/UX Design",
  },
];

function LessonsPage() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <LessonsHeader />
      <LessonsSearchFilter />
      <CategoryFilter />
      <ProgressOverview />
      <CurrentLessonHighlight />
      <LessonsList />
    </div>
  );
}


export default function LessonsPageContent() {
  return (
    <ProtectedRoute>
      <LessonsPage />
    </ProtectedRoute>
  );
}