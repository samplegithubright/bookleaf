"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { BookOpen, Shield, ArrowRight, Sparkles, CheckCircle2, IndianRupee } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.push("/admin/queue");
      } else {
        router.push("/author/books");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-12 text-center">
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
          BookLeaf AI Author Communication Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Author Support & Royalty Intelligence Portal
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Scaling author support across 22,000+ titles with AI auto-classification, priority scoring, and Knowledge Base-grounded response drafts.
        </p>
      </div>

      {/* Role Chooser Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
        {/* Author Portal Entry */}
        <Link
          href="/author/books"
          className="group bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Author Portal (Author-Facing)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View your published books, track 80/20 royalty payouts, submit support queries, and receive real-time updates.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span>My Books with MRP, copies sold, and pending payout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Submit queries with linked book context</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Real-time live WebSocket responses</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-teal-700">
            <span>Enter Author Dashboard</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Admin Portal Entry */}
        <Link
          href="/admin/queue"
          className="group bg-white rounded-2xl border border-purple-200/80 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-purple-400 transition-all flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Admin Operations Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage incoming tickets, review AI auto-classification, edit AI response drafts, and add internal notes.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                <span>AI Auto-Classification (6 categories)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                <span>AI-Generated Priority Score (Critical / High / Medium / Low)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                <span>Knowledge Base-grounded draft responses</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-purple-700">
            <span>Enter Operations Queue</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
