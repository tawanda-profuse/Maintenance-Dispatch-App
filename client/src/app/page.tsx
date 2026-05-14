"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Wrench, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-6xl font-black leading-tight">
            Maintenance
            <span className="text-blue-500"> Dispatch </span>
            Portal
          </h1>

          <p className="mt-6 text-slate-300 text-lg leading-relaxed">
            Streamline property maintenance workflows with secure task
            role-based access control, and real-time status tracking.
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/login" className="btn-primary">
              Get Started
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid gap-6"
        >
          <div className="card p-6">
            <Building2 className="text-blue-500 mb-4" size={40} />
            <h2 className="text-2xl font-bold">Property Managers</h2>
            <p className="mt-3 text-slate-300">
              Assign and manage maintenance operations efficiently.
            </p>
          </div>

          <div className="card p-6">
            <Wrench className="text-green-500 mb-4" size={40} />
            <h2 className="text-2xl font-bold">Maintenance Staff</h2>
            <p className="mt-3 text-slate-300">
              View assigned tasks and update progress instantly.
            </p>
          </div>

          <div className="card p-6">
            <ShieldCheck className="text-purple-500 mb-4" size={40} />
            <h2 className="text-2xl font-bold">Secure Access</h2>
            <p className="mt-3 text-slate-300">
              Session authentication with CSRF protection built-in.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
