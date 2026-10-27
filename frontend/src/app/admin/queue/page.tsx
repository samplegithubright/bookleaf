"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Ticket, fetchApi, getWebSocketUrl } from "@/lib/api";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/TicketBadge";
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  Radio, 
  Sparkles, 
  UserCheck, 
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Shield,
  Calendar
} from "lucide-react";

export default function AdminTicketQueuePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("urgency");

  const socketRef = useRef<WebSocket | null>(null);

  const loadData = async () => {
    if (!user || user.role !== "admin") return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (categoryFilter !== "All") params.append("category", categoryFilter);
      if (priorityFilter !== "All") params.append("priority", priorityFilter);
      if (dateFilter !== "All") params.append("date_filter", dateFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      params.append("sort_by", sortBy);

      const [ticketsData, statsData] = await Promise.all([
        fetchApi<Ticket[]>(`/admin/queue?${params.toString()}`),
        fetchApi<any>("/admin/stats")
      ]);

      setTickets(ticketsData);
      setStats(statsData);
    } catch (err: any) {
      console.error("Failed to fetch admin queue", err);
      if (err?.message?.includes("Access restricted") || err?.message?.includes("403")) {
        router.replace("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== "admin") {
      router.replace("/admin");
      return;
    }
    loadData();
  }, [statusFilter, categoryFilter, priorityFilter, dateFilter, sortBy, user, isLoading, router]);

  // Connect WebSocket for live updates
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const ws = new WebSocket(getWebSocketUrl("/ws/admin"));
    socketRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log("Admin queue live update:", payload);
        loadData();
      } catch (e) {
        console.error("WS error", e);
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Verifying Super Admin access...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Author Support Operations Queue
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                wsConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Radio className={`h-3 w-3 ${wsConnected ? "animate-pulse text-emerald-500" : ""}`} />
              {wsConnected ? "Live Queue" : "Connecting..."}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            AI-triaged incoming tickets across all 22,000+ catalog titles. Urgent and overdue queries are prioritized.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Total Inquiries</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.tickets.total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across all authors</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Open & Unresolved</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.tickets.unresolved}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{stats.tickets.open} Open • {stats.tickets.in_progress} In Progress</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-rose-200 bg-rose-50/30 shadow-sm">
            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              High / Critical Urgency
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-1">
              {stats.tickets.high_pending + stats.tickets.critical_pending}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">Requiring 48hr SLA action</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Resolved / Closed</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.tickets.resolved + stats.tickets.closed}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{stats.tickets.resolved} Resolved</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs font-medium text-slate-500">Pending Catalog Royalty</div>
            <div className="text-2xl font-bold text-teal-700 mt-1">₹{stats.catalog.total_royalty_pending.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Awaiting next batch payout</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #, author name, subject, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-300 text-sm placeholder:text-slate-400 text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-500 max-w-[160px]"
              >
                <option value="All">All Categories</option>
                <option value="Royalty & Payments">Royalty & Payments</option>
                <option value="ISBN & Metadata Issues">ISBN & Metadata Issues</option>
                <option value="Printing & Quality">Printing & Quality</option>
                <option value="Distribution & Availability">Distribution & Availability</option>
                <option value="Book Status & Production Updates">Book Status & Production Updates</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="urgency">Sort by Urgency (Critical & Oldest Unresolved)</option>
                <option value="newest">Sort by Newest First</option>
                <option value="oldest">Sort by Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Queue Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
          <p>Loading ticket queue...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <LayoutDashboard className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">No tickets matching the current criteria</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const isCriticalOrHigh = t.priority === "Critical" || t.priority === "High";
            const isOpen = t.status === "Open" || t.status === "In Progress";
            const highlightUrgency = isCriticalOrHigh && isOpen;

            return (
              <Link
                key={t.id || t.ticket_number}
                href={`/admin/tickets/${t.ticket_number || t.id}`}
                className={`block rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 ${
                  highlightUrgency
                    ? "bg-gradient-to-r from-rose-50/40 via-white to-white border-rose-300/80 hover:border-rose-400"
                    : "bg-white border-slate-200/80 hover:border-teal-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {t.ticket_number}
                      </span>

                      <StatusBadge status={t.status} />
                      <CategoryBadge category={t.category} />
                      <PriorityBadge priority={t.priority} />

                      {highlightUrgency && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> SLA Priority
                        </span>
                      )}

                      {/* AI Classification badge */}
                      {t.ai_category && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-purple-500" />
                          AI Classified
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {t.subject}
                    </h3>

                    {/* Author & Book Meta */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                      <div>
                        Author: <span className="font-semibold text-slate-800">{t.author_name}</span> ({t.author_id})
                      </div>
                      {t.book_title && t.book_title !== "General / Account Level" && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-teal-600" />
                          Book: <span className="font-medium text-slate-700">{t.book_title}</span>
                        </div>
                      )}
                      <div>
                        Assigned:{" "}
                        <span className={t.assigned_to ? "font-medium text-purple-700" : "italic text-amber-600 font-medium"}>
                          {t.assigned_admin_name || t.assigned_to || "Unassigned"}
                        </span>
                      </div>
                    </div>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-1 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{t.description}"
                    </p>
                  </div>

                  {/* Right Column: AI draft status and action link */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-teal-600 transition-colors">
                      Review & Reply
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
