"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  BookOpen
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin");
      return;
    }

    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchApi<any>("/admin/stats");
        setStats(data);
      } catch (err: any) {
        console.error("Failed to load analytics", err);
        if (err?.message?.includes("Access restricted") || err?.message?.includes("403")) {
          router.replace("/admin");
        }
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Verifying Super Admin access...</p>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
        <p>Loading analytics and metrics...</p>
      </div>
    );
  }

  const catEntries = Object.entries(stats.categories || {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Author Support & Operations Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Operational efficiency, AI triage metrics, and catalog financial performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Active Catalog Titles
            <BookOpen className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats.catalog.total_books}</div>
          <p className="text-xs text-slate-400">Published across 10 authors</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Lifetime Copies Sold
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {stats.catalog.total_copies_sold.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Amazon, Flipkart & BookLeaf</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Total Royalty Disbursed
            <IndianRupee className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ₹{stats.catalog.total_royalty_paid.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Out of ₹{stats.catalog.total_royalty_earned.toLocaleString()} earned</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            Pending Royalty Pool
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            ₹{stats.catalog.total_royalty_pending.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400">Scheduled for quarterly run</p>
        </div>
      </div>

      {/* Categories Breakdown & SLA Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume by Category */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-teal-600" />
              Ticket Volume by AI Category
            </h3>
            <span className="text-xs text-slate-400">Auto-Triaged</span>
          </div>

          <div className="space-y-3">
            {catEntries.map(([cat, count]: any) => {
              const pct = Math.round((count / (stats.tickets.total || 1)) * 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-900 font-bold">{count} tickets ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SLA & AI Copilot Impact */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Copilot & SLA Performance
            </h3>
            <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Active
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>AI Auto-Classification Accuracy</span>
                <span className="text-emerald-700 font-bold">100% Policy Grounded</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Tickets are categorized into the 6 BookLeaf operational domains upon creation, allowing instant routing to finance, production, or printing desks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>48-Hour Escalation SLA Standard</span>
                <span className="text-purple-700 font-bold">Enforced</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Queries involving delayed royalties, missing UTRs, or ISBN mismatches on Amazon are automatically assigned High/Critical priority with 48-hour resolution commitments.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Knowledge Base Grounding</span>
                <span className="text-teal-700 font-bold">80/20 Royalty & Free Reprints</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                AI draft responses automatically incorporate BookLeaf's net profit formula, Delhi warehouse 5–7 day turnaround, and empathetic partner tone guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
