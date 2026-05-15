"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User } from "lucide-react";

import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Loader from "@/components/Loader";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
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

interface User {
  id: number;
  username: string;
}

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [request, setRequest] = useState<Request | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    assigned_to_id: "",
  });
  const csrfToken1 = Cookies.get("csrftoken");
  const csrfToken2 = useAuthStore.getState().csrfToken || "";

  console.log({csrfToken1, csrfToken2})

  const fetchRequestDetails = useCallback(async () => {
    try {
      const response = await api.get(`/requests/${requestId}/`);
      setRequest(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        assigned_to_id: response.data.assigned_to?.id?.toString() || "",
      });
    } catch (error) {
      console.error("Failed to fetch request details:", error);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
      };

      await api.put(`/requests/${requestId}/`, updateData);
      await fetchRequestDetails(); // Refresh data
      toast.success("Request updated successfully");
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to update request");
      console.error("Failed to update request:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!formData.assigned_to_id) return;

    setAssigning(true);
    try {
      await api.post(`/requests/${requestId}/assign/`, {
        assigned_to_id: parseInt(formData.assigned_to_id),
      });
      await fetchRequestDetails(); // Refresh data
      toast.success("Request assigned successfully");
    } catch (error) {
      console.error("Failed to assign request:", error);
      toast.error("Failed to assign request");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <Sidebar />
        <div className="mx-auto max-w-4xl">
          <Loader label="Loading request details..." />
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="min-h-screen p-6">
        <Sidebar />
        <div className="mx-auto max-w-4xl">
          <div className="card p-12 text-center">
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              Request not found
            </h3>
            <p className="text-slate-500">
              The requested maintenance request could not be found.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen p-6">
        <Sidebar />

      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push("/requests")}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Requests
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black">Request Details</h1>
              <p className="text-slate-400 mt-2">Request #{request.id}</p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="btn-primary cursor-pointer"
            >
              {editMode ? "Cancel Edit" : "Edit Request"}
            </button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Request Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            {editMode ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input w-full h-32 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="input w-full"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <Save size={16} />
                  {updating ? "Updating..." : "Update Request"}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Title
                  </h3>
                  <p className="text-slate-600">{request.title}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {request.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Status
                    </h3>
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        request.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : request.status === "In Progress"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Created
                    </h3>
                    <p className="text-slate-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Resident
                    </h3>
                    <p className="text-slate-600">
                      {request.resident.username}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Assigned To
                    </h3>
                    <p className="text-slate-600">
                      {request.assigned_to?.username || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Assignment Card */}
          {request.status === "Pending" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User size={18} />
                Assign Request
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Maintenance Staff
                  </label>
                  <select
                    value={formData.assigned_to_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assigned_to_id: e.target.value,
                      })
                    }
                    className="input w-full"
                  >
                    <option value="">Select a staff member...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAssign}
                  disabled={assigning || !formData.assigned_to_id}
                  className="btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <User size={16} />
                  {assigning ? "Assigning..." : "Assign Request"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
    </AuthGuard>
  );
}
