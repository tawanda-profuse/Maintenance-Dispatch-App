"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, Clock3, Users, HomeIcon, Wrench } from "lucide-react";

import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth-store";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/manager-users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = () => {
      if (user?.role !== "Property Manager") {
        router.push("/dashboard");
        toast.info("This page is only for Managers");
        return;
      }
    };
    initialize();
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <Sidebar />
        <div className="max-w-4xl mx-auto">
          <Loader label="Loading requests..." />
        </div>
      </main>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen p-12">
        <Sidebar />

        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-black">Platform Users</h1>
              <p className="text-slate-400 mt-2">View all users.</p>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="card p-6">
              <Users className="text-blue-500 mb-3" size={24} />
              <h2 className="text-3xl font-bold">{users.length}</h2>
              <p className="text-slate-600">Total Users</p>
            </div>

            <div className="card p-6">
              <Clock3 className="text-yellow-500 mb-3" size={24} />
              <h2 className="text-3xl font-bold">
                {
                  users?.filter((user) => user?.role === "Property Manager")
                    .length
                }
              </h2>
              <p className="text-slate-600">Managers</p>
            </div>

            <div className="card p-6">
              <HomeIcon className="text-orange-500 mb-3" size={24} />
              <h2 className="text-3xl font-bold">
                {users?.filter((user) => user?.role === "Resident").length}
              </h2>
              <p className="text-slate-600">Residents</p>
            </div>

            <div className="card p-6">
              <Wrench className="text-green-500 mb-3" size={24} />
              <h2 className="text-3xl font-bold">
                {
                  users?.filter((user) => user?.role === "Maintenance Staff")
                    .length
                }
              </h2>
              <p className="text-slate-600">Maintenance Staff</p>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-6">
            {users.length === 0 ? (
              <div className="card p-12 text-center">
                <ClipboardList
                  className="mx-auto text-slate-400 mb-4"
                  size={48}
                />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No users found
                </h3>
                <p className="text-slate-500">
                  There are no user accounts at the moment.
                </p>
              </div>
            ) : (
              <motion.table
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative mx-auto border-collapse w-full"
              >
                <motion.thead className="text-blue-500 text-left text-xl">
                  <tr className="border-b-2 border-gray-500">
                    <th className="p-2">Username</th>
                    <th className="p-2">First Name</th>
                    <th className="p-2">Last Name</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Email</th>
                  </tr>
                </motion.thead>
                <motion.tbody>
                  {users.map((item) => (
                    <motion.tr
                      key={item.id}
                      className="border-b border-gray-500"
                    >
                      <td className="p-2">{item?.username}</td>
                      <td className="p-2">{item?.first_name || "--"}</td>
                      <td className="p-2">{item?.last_name || "--"}</td>
                      <td className="p-2">{item?.role || "--"}</td>
                      <td className={`p-2 ${item?.email ? "underline" : ""}`}>
                        {item?.email || "--"}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </motion.table>
            )}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
