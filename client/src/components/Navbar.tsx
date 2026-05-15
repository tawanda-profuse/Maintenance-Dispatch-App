"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { useAuthStore } from "@/stores/auth-store";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Only show navbar on login and home pages
  if (pathname !== "/" && pathname !== "/login") {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black text-slate-900">
              Maintenance<span className="text-blue-600">Dispatch</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-primary"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-primary"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}