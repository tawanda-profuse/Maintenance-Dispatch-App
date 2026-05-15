"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardList, Clock3, CheckCircle2, Plus, X } from "lucide-react";

import api from "@/lib/api";
import RequestCard from "@/components/RequestCard";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/auth-store";

interface Request {
  id: number;
  title: string;
  description: string;
  resident: {
    id: number;
    username: string;
  };
  assigned_to?: {
    id: number;
    username: string;
  };
  status: string;
  created_at: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const fetchRequests = useCallback(async () => {
    try {
      const response = await api.get("/requests/");
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title.trim() || !newRequest.description.trim()) return;

    setCreating(true);
    try {
      await api.post("/requests/", newRequest);
      setNewRequest({ title: "", description: "" });
      setShowCreateForm(false);
      await fetchRequests(); // Refresh the list
      toast.success("Request created successfully");
    } catch (error) {
      toast.error("Failed to create request");
      console.error("Failed to create request:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetails = (id: number) => {
    router.push(`/requests/${id}`);
  };

  const pending = requests.filter((r) => r.status === "Pending").length;
  const inProgress = requests.filter((r) => r.status === "In Progress").length;
  const completed = requests.filter((r) => r.status === "Completed").length;

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
              <h1 className="text-4xl font-black">Maintenance Requests</h1>
              <p className="text-slate-400 mt-2">
                View and manage all maintenance requests.
              </p>
            </div>
            {user?.role !== "Maintenance Staff" && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                New Request
              </button>
            )}
          </motion.div>

          {/* Create Request Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Request</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 cursor-pointer"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, title: e.target.value })
                    }
                    className="input w-full"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) =>
                      setNewRequest({
                        ...newRequest,
                        description: e.target.value,
                      })
                    }
                    className="input w-full h-32 resize-none"
                    placeholder="Detailed description of the maintenance request"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary flex-1 cursor-pointer"
                  >
                    {creating ? "Creating..." : "Create Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="card p-6">
              <ClipboardList className="text-blue-500 mb-3" size={24} />
              <h2 className="text-3xl font-bold">{requests.length}</h2>
              <p className="text-slate-600">Total Requests</p>
            </div>

            <div className="card p-6">
              <Clock3 className="text-yellow-500 mb-3" size={24} />
              <h2 className="text-3xl font-bold">{pending}</h2>
              <p className="text-slate-600">Pending</p>
            </div>

            <div className="card p-6">
              <div className="mb-3 h-6 w-6 rounded-full bg-orange-500"></div>
              <h2 className="text-3xl font-bold">{inProgress}</h2>
              <p className="text-slate-600">In Progress</p>
            </div>

            <div className="card p-6">
              <CheckCircle2 className="text-green-500 mb-3" size={24} />
              <h2 className="text-3xl font-bold">{completed}</h2>
              <p className="text-slate-600">Completed</p>
            </div>
          </div>

          {/* Requests List */}
          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="card p-12 text-center">
                <ClipboardList
                  className="mx-auto text-slate-400 mb-4"
                  size={48}
                />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  No requests found
                </h3>
                <p className="text-slate-500">
                  There are no maintenance requests at the moment.
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative cursor-pointer"
                  onClick={() => handleViewDetails(request.id)}
                  title="View details"
                >
                  <RequestCard request={request} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
