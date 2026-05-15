"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

import api from "@/lib/api";
import { getCSRFToken } from "@/lib/csrf";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, checkAuth } = useAuthStore();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordType, setPasswordType] = useState("password");

  useEffect(() => {
    const initialize = async () => {
      if (isAuthenticated) {
        router.push("/dashboard");
        return;
      }

      try {
        const response = await api.get("/login/");
        const data = response.data;

        if (data.user) {
          login(data.user, data.csrf_token);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to initialize CSRF token", error);
      }
    };

    initialize();
  }, [isAuthenticated, login, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/login/", form);
      const { csrf_token, user } = response.data;

      login(user, csrf_token);
      router.push("/dashboard");
    } catch (error: unknown) {
      setError("Invalid username or password");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card w-full max-w-md p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-xl text-white">
            <LogIn />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-blue-600">Welcome Back</h1>
            <p className="text-slate-900 text-sm">Sign into your account</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            className="input"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <div className="relative">
            <input
              type={passwordType}
              placeholder="Password"
              value={form.password}
              className="input"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() =>
                setPasswordType(
                  passwordType === "password" ? "text" : "password",
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 cursor-pointer"
            >
              {passwordType === "password" ? "Show" : "Hide"}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            className="btn-primary w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
