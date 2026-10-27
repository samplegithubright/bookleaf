"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, KeyRound, User, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as super admin, immediately go to the admin dashboard
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      setIsNavigating(true);
      router.replace("/admin/queue");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Normalize username (allow typing "admin" or full email "admin@bookleaf.com")
      const cleanInput = username.trim();
      const emailToUse = cleanInput === "admin" ? "admin@bookleaf.com" : cleanInput;

      await login(emailToUse, password, false);

      // Verify admin role
      const currentUser = JSON.parse(localStorage.getItem("bookleaf_user") || "{}");
      if (currentUser?.role !== "admin") {
        setError("This account does not have Super Admin privileges. Please use an administrator account.");
        setIsSubmitting(false);
        return;
      }

      // Smooth transition to Super Admin Dashboard
      setIsNavigating(true);
      router.replace("/admin/queue");
    } catch (err: any) {
      console.error("Super Admin login error:", err);
      setError(err.message || "Invalid credentials. Please verify your Super Admin username and password.");
      setIsSubmitting(false);
    }
  };

  // If already logged in or navigating, show smooth transition loader rather than flashing the login form
  if (isNavigating || (!isLoading && user?.role === "admin")) {
    return (
      <div className="w-full max-w-md mx-auto py-16 text-center space-y-4">
        <div className="inline-flex h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 items-center justify-center text-purple-600 shadow-md animate-pulse">
          <Shield className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Entering Super Admin Dashboard</h2>
          <p className="text-xs text-slate-500">Connecting to BookLeaf operations and AI queue...</p>
        </div>
        <div className="pt-2 flex justify-center">
          <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 items-center justify-center text-purple-600 mb-1 shadow-sm">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Super Admin Login
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your administrator credentials to access the Super Admin Dashboard
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Super Admin Sign In</h2>
            <p className="text-xs text-slate-400">BookLeaf Publishing Operations & AI Hub</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Super Admin
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Admin Username or Email
            </label>
            <div className="relative">
              <User className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or admin email"
                autoComplete="off"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="new-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Sign In to Super Admin Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
