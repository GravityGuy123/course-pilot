"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "../shared/DataTable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/axios.config";
import { Skeleton } from "@/components/ui/skeleton"; // Optional if you have a skeleton component

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  enrolledDate: string;
}

export function TutorDashboardStudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get<Student[]>("/tutor/students");
        setStudents(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load students.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const studentColumns: Column<Student>[] = [
    {
      key: "name",
      label: "Student",
      sortable: true,
      render: (item: Student) => (
        <div className="flex items-center gap-2 min-w-[150px]">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{item.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div className="truncate">
            <p className="font-medium text-sm truncate">{item.name}</p>
            <p className="text-xs text-muted-foreground truncate">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      sortable: true,
      render: (item: Student) => <p className="truncate max-w-[120px]">{item.course}</p>,
    },
    {
      key: "progress",
      label: "Progress",
      sortable: true,
      render: (item: Student) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress value={item.progress} className="h-2 flex-1" />
          <span className="text-xs font-medium w-10">{item.progress}%</span>
        </div>
      ),
    },
    { key: "enrolledDate", label: "Enrolled", sortable: true },
  ];

  if (loading)
    return (
      <div className="space-y-4 mt-6">
        {[...Array(5)].map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full rounded-md" />
        ))}
      </div>
    );

  if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;
  if (students.length === 0) return <p className="text-center mt-6">No students enrolled yet.</p>;

  return (
    <Card className="dark:bg-gray-800 overflow-x-auto">
      <CardHeader>
        <CardTitle>Enrolled Students</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <DataTable
          data={students}
          columns={studentColumns}
          searchKey="name"
          searchPlaceholder="Search students..."
        />
      </CardContent>
    </Card>
  );
}