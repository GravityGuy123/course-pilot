"use client";

import { RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  q: string;
  onQChange: (v: string) => void;

  published: "all" | "published" | "draft";
  onPublishedChange: (v: "all" | "published" | "draft") => void;

  pricing: "all" | "FREE" | "PAID";
  onPricingChange: (v: "all" | "FREE" | "PAID") => void;

  sort: "newest" | "oldest" | "students";
  onSortChange: (v: "newest" | "oldest" | "students") => void;

  onRefresh: () => void;
  refreshing: boolean;
};

function isPublishedValue(v: string): v is Props["published"] {
  return v === "all" || v === "published" || v === "draft";
}

function isPricingValue(v: string): v is Props["pricing"] {
  return v === "all" || v === "FREE" || v === "PAID";
}

function isSortValue(v: string): v is Props["sort"] {
  return v === "newest" || v === "oldest" || v === "students";
}

export function TutorCoursesToolbar({
  q,
  onQChange,
  published,
  onPublishedChange,
  pricing,
  onPricingChange,
  sort,
  onSortChange,
  onRefresh,
  refreshing,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => onQChange(e.target.value)}
          placeholder="Search by title or category..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <Select
          value={published}
          onValueChange={(v: string) => {
            if (!isPublishedValue(v)) return;
            onPublishedChange(v);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Published" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={pricing}
          onValueChange={(v: string) => {
            if (!isPricingValue(v)) return;
            onPricingChange(v);
          }}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Pricing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v: string) => {
            if (!isSortValue(v)) return;
            onSortChange(v);
          }}
        >
          <SelectTrigger className="w-full sm:w-40 col-span-2 sm:col-span-1">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="students">Most students</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className="w-full col-span-2 sm:col-span-1 sm:w-auto"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}