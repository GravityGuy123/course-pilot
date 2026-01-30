"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api, bootstrapCsrf } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, CreateCourseInput } from "@/lib/schema";
import { SuccessToast } from "@/lib/toast";
import { useTheme } from "next-themes";

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export default function CreateCoursePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    mode: "onChange",
  });

  const watchedPrice = watch("price") ?? "";

  // Fetch categories dynamically
  useEffect(() => {
    let alive = true;

    const fetchCategories = async () => {
      try {
        await bootstrapCsrf();
        const res = await api.get<{ id: string; name: string }[]>(
          "/courses/categories/"
        );
        if (alive) setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();

    return () => {
      alive = false;
    };
  }, []);

  // Cleanup preview object URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ✅ keep your original regex logic
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectionStart = input.selectionStart ?? 0;

    let value = input.value.replace(/[^0-9]/g, "");
    value = value.replace(/^0+/, "");
    if (value.length > 9) value = value.slice(0, 9);

    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const commasBeforeCursor =
      formatted.slice(0, selectionStart).match(/,/g)?.length ?? 0;

    const newCursorPos = selectionStart + commasBeforeCursor;

    setValue("price", formatted, { shouldValidate: true });

    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const onSubmit = async (data: CreateCourseInput) => {
    try {
      setFormError(null);

      await bootstrapCsrf();

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category_id", data.category_id);
      formData.append("level", data.level);

      if (data.duration) {
        formData.append("duration", data.duration);
      }

      // ✅ Convert price here (NO ZOD TRANSFORM) - keep regex
      const numericPrice = Number(data.price.replace(/,/g, ""));
      formData.append("price", String(numericPrice));

      formData.append("image", data.image);

      // ✅ backend route (from your refactor)
      const res = await api.post("/courses/tutor/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const courseId = res.data?.id as string | undefined;
      if (courseId) {
        SuccessToast("Course created successfully 🎉", isDark, {
          position: "top-right",
        });

        setTimeout(() => {
          router.push(`/dashboard/tutor/courses/${courseId}`);
        }, 800);
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: Record<string, unknown> } })
          .response;

        if (response?.data && typeof response.data === "object") {
          setFormError("Failed to create course. Check highlighted fields.");

          Object.entries(response.data).forEach(([key, value]) => {
            if (typeof value === "string") {
              setError(key as keyof CreateCourseInput, {
                type: "manual",
                message: value,
              });
            } else if (Array.isArray(value) && typeof value[0] === "string") {
              setError(key as keyof CreateCourseInput, {
                type: "manual",
                message: value[0],
              });
            }
          });
          return;
        }
      }

      setFormError("Failed to create course. Try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Create New Course
      </h1>

      {formError && <p className="text-red-600 font-medium">{formError}</p>}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        encType="multipart/form-data"
      >
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title *</label>
          <input
            {...register("title")}
            className="w-full p-2 border rounded-md"
            placeholder="Cyber Security"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description *</label>
          <textarea
            {...register("description")}
            rows={5}
            className="w-full p-2 border rounded-md"
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">Category *</label>
          <select
            {...register("category_id")}
            className="w-full p-3 border rounded-lg shadow-sm border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-violet-400 dark:focus:border-violet-400 transition-colors duration-200"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>

        {/* Level */}
        <div>
          <label className="block mb-1 font-medium">Level *</label>
          <select
            {...register("level")}
            className="w-full p-3 border rounded-lg shadow-sm border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-violet-400 dark:focus:border-violet-400 transition-colors duration-200"
          >
            <option value="">Select level</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {errors.level && (
            <p className="text-sm text-red-500">{errors.level.message}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block mb-1 font-medium">Duration</label>
          <input
            {...register("duration")}
            className="w-full p-2 border rounded-md"
            placeholder="e.g. 12 weeks"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 font-medium">Price (₦) *</label>
          <input
            type="text"
            {...register("price")}
            value={watchedPrice}
            onChange={handlePriceChange}
            className="w-full p-2 border rounded-md"
            placeholder="e.g. 50,000"
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        {/* Image */}
        <div>
          <div className="flex justify-between">
            <label className="block mb-2 font-medium">Course Image *</label>
            <label
              htmlFor="course-image"
              className="text-violet-600 dark:text-indigo-500 cursor-pointer hover:underline"
            >
              Select Image
            </label>
          </div>

          <input
            id="course-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue("image", file, { shouldValidate: true });
                if (preview) URL.revokeObjectURL(preview);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />

          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message}</p>
          )}

          {preview && (
            <div className="relative h-40 w-full mt-3">
              <Image
                src={preview}
                alt="Course preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white bg-violet-600 hover:bg-violet-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-all duration-300"
        >
          {isSubmitting ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </div>
  );
}
