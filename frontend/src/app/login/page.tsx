"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Shield, KeyRound, Mail, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, quickSwitch } = useAuth();
  const [email, setEmail] = useState("priya.sharma@email.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = async (presetEmail: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await quickSwitch(presetEmail);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 items-center justify-center text-teal-600 mb-1 shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            BookLeaf Publishing
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Author Support & Operations Communication Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Sign in to your account</h2>
            <p className="text-xs text-slate-400">Access your published catalog or operations queue.</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@email.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Evaluator Access Presets */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Quick Test Logins (1-Click)</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handlePreset("priya.sharma@email.com")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200 text-left transition-colors"
              >
                <div className="font-semibold">Priya Sharma</div>
                <div className="text-[10px] text-slate-400">Author (AUTH001)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreset("rohit.kapoor@email.com")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200 text-left transition-colors"
              >
                <div className="font-semibold">Rohit Kapoor</div>
                <div className="text-[10px] text-slate-400">Author (AUTH002)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreset("sneha.kulkarni@email.com")}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200 text-left transition-colors"
              >
                <div className="font-semibold">Sneha Kulkarni</div>
                <div className="text-[10px] text-slate-400">Author (AUTH007)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePreset("admin@bookleaf.com")}
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-left transition-colors"
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Ops Admin</span>
                  <Shield className="h-3 w-3 text-purple-700" />
                </div>
                <div className="text-[10px] text-purple-600 font-medium">BookLeaf Team</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
