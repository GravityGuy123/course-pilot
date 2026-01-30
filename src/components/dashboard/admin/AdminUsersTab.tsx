"use client";

import { useEffect, useState } from "react";
import { Search, Download, Trash2, User } from "lucide-react";
import { api } from "@/lib/axios.config";
import AdminStatusBadge from "./AdminStatusBadge";
import UserAvatar from "@/components/shared/UserAvatar";

interface AdminUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar?: string | null;
  is_active: boolean;
  roles: string[];
}

export default function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get<AdminUser[]>("/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = () => {
    const csv = [
      ["Email", "Full Name", "Roles", "Active"],
      ...users.map((u) => [
        u.email,
        u.full_name,
        u.roles.join(" | "),
        u.is_active ? "Yes" : "No",
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users.csv";
    link.click();
  };

  if (loading) {
    return <p className="text-gray-500 dark:text-gray-400">Loading users...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Users
        </h2>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* Left: Avatar + Info */}
              <div className="flex items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="block sm:hidden">
                  <UserAvatar user={user} size={32} />
                </div>
                <div className="hidden sm:block lg:hidden">
                  <UserAvatar user={user} size={40} />
                </div>
                <div className="hidden lg:block">
                  <UserAvatar user={user} size={48} />
                </div>

                {/* User Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {user.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.roles.map((role) => (
                      <AdminStatusBadge
                        key={role}
                        status={role.toLowerCase()}
                      />
                    ))}
                    <AdminStatusBadge
                      status={user.is_active ? "active" : "inactive"}
                    />
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg w-full sm:w-auto">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}