"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Clock3, CheckCircle2 } from "lucide-react";

import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRequests = async () => {
      try {
        const response = await api.get("/requests/");
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        toast.error("Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [isAuthenticated]);

  const pending = requests.filter(
    (r: { status: string }) => r.status === "Pending",
  ).length;

  const completed = requests.filter(
    (r: { status: string }) => r.status === "Completed",
  ).length;

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
      <main className="min-h-screen p-6">
        <Sidebar />
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black">Dashboard</h1>
            <p className="text-slate-400 mt-2">
              Monitor maintenance operations in real-time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="card p-6">
              <ClipboardList className="text-blue-500 mb-3" />
              <h2 className="text-3xl font-bold mb-3">{requests.length}</h2>
              <p className="text-slate-600">Total Requests</p>
            </div>

            <div className="card p-6">
              <Clock3 className="text-yellow-500 mb-3" />
              <h2 className="text-3xl font-bold mb-3">{pending}</h2>
              <p className="text-slate-600">Pending</p>
            </div>

            <div className="card p-6">
              <CheckCircle2 className="text-yellow-500 mb-3" />
              <h2 className="text-3xl font-bold mb-3">{completed}</h2>
              <p className="text-slate-600">Completed</p>
            </div>
          </div>

          <div className="card p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between bg-slate-50">
              <div>
                <p className="text-slate-500 uppercase tracking-[0.3em] text-xs">
                  Profile
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">
                  {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : `@${user?.username}`}
                </h2>
                <p className="mt-2 text-sm text-slate-500">{user?.role}</p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-(--primary-light) text-2xl font-black text-(--primary)">
                {user?.first_name && user?.last_name ? `${user?.first_name?.[0]}${user?.last_name?.[0]}` : user?.username?.[0].toUpperCase()}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Username</p>
                <p className="mt-2 text-base font-medium text-slate-900">{user?.username || "--"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
                <p className="mt-2 text-base font-medium text-slate-900">{user?.email || "--"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">First Name</p>
                <p className="mt-2 text-base font-medium text-slate-900">{user?.first_name || "--"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Last Name</p>
                <p className="mt-2 text-base font-medium text-slate-900">{user?.last_name || "--"}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
