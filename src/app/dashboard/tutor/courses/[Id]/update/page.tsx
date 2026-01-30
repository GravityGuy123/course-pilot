"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/axios.config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CoursePageDetails } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema } from "@/lib/schema";
import z from "zod";
import { SuccessToast } from "@/lib/toast";
import { useTheme } from "next-themes";

/* ---------------- CONSTANTS ---------------- */

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
type Level = (typeof LEVELS)[number];

const isValidLevel = (value: string): value is Level =>
  LEVELS.includes(value as Level);

const updateCourseSchema = createCourseSchema.partial({
  image: true,
});

type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

/* ---------------- PAGE ---------------- */

export default function UpdateCoursePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();

  /* ✅ SAFE PARAM HANDLING */
  const params = useParams();
  const courseId =
    typeof params?.id === "string" ? params.id : null;

  const [course, setCourse] = useState<CoursePageDetails | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCourseInput>({
    resolver: zodResolver(updateCourseSchema),
    mode: "onChange",
  });

  const watchedPrice = watch("price") ?? "";

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (!courseId || !user) return;

    const fetchData = async () => {
      try {
        const [courseRes, categoryRes] = await Promise.all([
          api.get<CoursePageDetails>(`/courses/${courseId}`),
          api.get<{ id: string; name: string }[]>(
            "/courses/categories"
          ),
        ]);

        if (
          String(user.id) !==
          String(courseRes.data.tutor?.id)
        ) {
          router.replace("/403");
          return;
        }

        const matchedCategory = categoryRes.data.find(
          (c) => c.name === courseRes.data.category
        );

        setCourse(courseRes.data);
        setCategories(categoryRes.data);

        setValue("title", courseRes.data.title);
        setValue("description", courseRes.data.description);
        setValue("category_id", matchedCategory?.id ?? "");

        if (isValidLevel(courseRes.data.level)) {
          setValue("level", courseRes.data.level);
        }

        setValue("duration", courseRes.data.duration || "");
        setValue("price", String(courseRes.data.price));

        if (courseRes.data.image) {
          setPreview(courseRes.data.image);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user, router, setValue]);

  /* ---------------- PRICE FORMAT ---------------- */

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectionStart = input.selectionStart ?? 0;

    let value = input.value.replace(/[^0-9]/g, "");
    value = value.replace(/^0+/, "");
    if (value.length > 9) value = value.slice(0, 9);

    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const commasBefore =
      formatted.slice(0, selectionStart).match(/,/g)?.length ?? 0;

    setValue("price", formatted, { shouldValidate: true });

    requestAnimationFrame(() => {
      const pos = selectionStart + commasBefore;
      input.setSelectionRange(pos, pos);
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = async (data: UpdateCourseInput) => {
    if (!courseId) return;

    try {
      setFormError(null);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category_id", data.category_id);
      formData.append("level", data.level);

      if (data.duration) {
        formData.append("duration", data.duration);
      }

      const numericPrice = Number(data.price.replace(/,/g, ""));
      formData.append("price", String(numericPrice));

      if (data.image) {
        formData.append("image", data.image);
      }

      await api.patch(
        `/tutor/course/${courseId}/update/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      SuccessToast("Course updated successfully 🎉", isDark, {
        position: "top-right",
      });

      setTimeout(() => {
        router.push(`/dashboard/tutor/courses/${courseId}`);
      }, 800);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (
          error as {
            response?: { data?: Record<string, unknown> };
          }
        ).response;

        if (response?.data) {
          setFormError(
            "Failed to update course. Check highlighted fields."
          );

          Object.entries(response.data).forEach(
            ([key, value]) => {
              if (typeof value === "string") {
                setError(key as keyof UpdateCourseInput, {
                  type: "manual",
                  message: value,
                });
              } else if (
                Array.isArray(value) &&
                typeof value[0] === "string"
              ) {
                setError(key as keyof UpdateCourseInput, {
                  type: "manual",
                  message: value[0],
                });
              }
            }
          );
        }
      }
    }
  };

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="w-10 h-10 text-violet-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <p className="text-center text-red-500 mt-10">
        Course not found
      </p>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {/* IMAGE */}
      <div>
        <div className="flex justify-between">
          <label className="block mb-2 font-medium">
            Course Image
          </label>
          <label
            htmlFor="course-image"
            className="text-indigo-500 cursor-pointer hover:underline"
          >
            Change Image
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
              setPreview(URL.createObjectURL(file));
            }
          }}
        />

        {errors.image && (
          <p className="text-sm text-red-500">
            {errors.image.message}
          </p>
        )}

        {preview && (
          <div className="relative h-48 w-full mt-3">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">
            Title *
          </label>
          <Input {...register("title")} />
          {errors.title && (
            <p className="text-sm text-red-500">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">
            Description *
          </label>
          <textarea
            {...register("description")}
            rows={7}
            className="w-full p-3 border rounded-md"
          />
          {errors.description && (
            <p className="text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 font-medium">
            Category *
          </label>
          <select
            {...register("category_id")}
            className="w-full rounded-lg border px-3 py-2 text-sm"
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
            <p className="text-sm text-red-500">
              {errors.category_id.message}
            </p>
          )}
        </div>

        {/* Level */}
        <div>
          <label className="block mb-1 font-medium">
            Level *
          </label>
          <select
            {...register("level")}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {errors.level && (
            <p className="text-sm text-red-500">
              {errors.level.message}
            </p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block mb-1 font-medium">
            Duration
          </label>
          <Input
            {...register("duration")}
            placeholder="e.g. 12 weeks"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 font-medium">
            Price (₦) *
          </label>
          <Input
            type="text"
            value={watchedPrice}
            onChange={handlePriceChange}
          />
          {errors.price && (
            <p className="text-sm text-red-500">
              {errors.price.message}
            </p>
          )}
        </div>

        {formError && (
          <p className="text-sm text-red-600">{formError}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}