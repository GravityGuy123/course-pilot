"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios.config";
import { CourseModule } from "@/lib/types";

interface ModuleCardProps {
  module: CourseModule;
  courseId: string;
}

export const ModuleCard = ({ module, courseId }: ModuleCardProps) => {
  const router = useRouter();

  const togglePublish = async () => {
    await api.patch(`/modules/${module.id}/publish`);
    router.refresh();
  };

  const deleteModule = async () => {
    if (!confirm("Delete this module?")) return;

    await api.delete(`/modules/${module.id}`);
    router.refresh();
  };

  return (
    <div className="group border rounded-lg p-4 space-y-3 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {module.order}. {module.title}
        </h3>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            module.is_published
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {module.is_published ? "Published" : "Draft"}
        </span>
      </div>

      {module.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {module.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() =>
            router.push(
              `/dashboard/tutor/courses/${courseId}/modules/${module.id}`
            )
          }
        >
          View Lessons
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() =>
            router.push(
              `/dashboard/tutor/courses/${courseId}/modules/${module.id}/update`
            )
          }
        >
          Edit
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={togglePublish}
        >
          {module.is_published ? "Unpublish" : "Publish"}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          className="cursor-pointer ml-auto"
          onClick={deleteModule}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};