"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, PlayCircle } from "lucide-react";
import { RecommendedCourse } from "@/lib/types";

const mockRecommendedCourses: RecommendedCourse[] = [
  {
    id: 4,
    title: "Advanced TypeScript Patterns",
    category: "Web Development",
    duration: "6h 00m",
    rating: 4.8,
    tutor: { full_name: "Mike Chen" },
  },
  {
    id: 5,
    title: "Node.js Backend Development",
    category: "Backend",
    duration: "15h 00m",
    rating: 4.7,
    tutor: { full_name: "Alex Rivera" },
  },
  {
    id: 6,
    title: "Machine Learning Basics",
    category: "AI/ML",
    duration: "20h 00m",
    rating: 4.9,
    tutor: { full_name: "Dr. Lisa Wang" },
  },
];

export default function StudentDashboardRecommendations() {
  return (
    <Card className="overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-md rounded-2xl">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-5">
        <CardTitle className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
          Recommended For You
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          View all <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {mockRecommendedCourses.map((course, idx) => {
          // Gradient palette for icon and card glow
          const gradients = [
            {
              icon: "from-indigo-500 to-purple-500",
              glow: "shadow-indigo-200/50",
            },
            { icon: "from-pink-500 to-red-500", glow: "shadow-pink-200/50" },
            { icon: "from-teal-400 to-blue-500", glow: "shadow-teal-200/50" },
          ];
          const gradient = gradients[idx % gradients.length];

          return (
            <div
              key={course.id}
              className={`
                flex flex-col sm:flex-row sm:items-center sm:justify-between
                p-4 sm:p-5 gap-3 sm:gap-0 rounded-2xl
                bg-white dark:bg-gray-800
                shadow-sm hover:shadow-2xl transition-all duration-300
                transform hover:scale-105
              `}
            >
              {/* Course Info */}
              <div className="flex items-center gap-4 sm:gap-5 flex-1">
                <div
                  className={`
                    shrink-0 w-12 h-12 sm:w-14 sm:h-14
                    rounded-full p-3
                    bg-gradient-to-tr ${gradient.icon}
                    flex items-center justify-center
                    shadow-md
                  `}
                >
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-semibold text-sm sm:text-base line-clamp-2 text-gray-800 dark:text-white">
                    {course.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {course.tutor?.full_name} • {course.duration}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <Badge variant="secondary" className="text-xs sm:text-sm">
                  {course.category}
                </Badge>
                <Button
                  size="sm"
                  className={`
                    text-white
                    bg-gradient-to-r from-violet-600 to-indigo-600
                    hover:from-violet-700 hover:to-indigo-700
                    shadow-lg
                    transition-all duration-300
                  `}
                >
                  Enroll
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
