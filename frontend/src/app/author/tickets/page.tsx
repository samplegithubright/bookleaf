"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Ticket, fetchApi, getWebSocketUrl } from "@/lib/api";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/TicketBadge";
import { 
  MessageSquare, 
  PlusCircle, 
  Clock, 
  User, 
  ArrowRight, 
  AlertCircle,
  Radio,
  BookOpen
} from "lucide-react";

export default function AuthorTicketsPage() {
  const { user, isLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<Ticket[]>("/tickets/my-tickets");
      setTickets(data);
    } catch (err) {
      console.error("Failed to load author tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    loadTickets();

    // Setup Real-time WebSocket connection
    if (user?.author_id) {
      const wsUrl = getWebSocketUrl(`/ws/author/${user.author_id}`);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log("WebSocket connected to author channel:", user.author_id);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("Real-time event received:", payload);
          if (payload.event === "new_ticket" || payload.event === "ticket_updated" || payload.event === "ticket_status_changed") {
            // Re-fetch or update list in real time!
            loadTickets();
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      return () => {
        ws.close();
      };
    }
  }, [user, isLoading]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Support Tickets
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                wsConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Radio className={`h-3 w-3 ${wsConnected ? "animate-pulse text-emerald-500" : ""}`} />
              {wsConnected ? "Real-time Live Sync" : "Syncing..."}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Track questions, operational updates, and live communication with the BookLeaf team.
          </p>
        </div>

        <Link
          href="/author/tickets/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Raise New Query
        </Link>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
          <p>Loading your support tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 space-y-4 shadow-sm">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-slate-800">No support tickets raised yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Have questions regarding your book's royalties, distribution listings, or print quality? Submit a query anytime!
            </p>
          </div>
          <Link
            href="/author/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-500"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Submit Your First Query
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => {
            const lastMsg = t.messages[t.messages.length - 1];
            const hasAdminReply = t.messages.some((m) => m.sender_role === "admin");

            return (
              <Link
                key={t.id || t.ticket_number}
                href={`/author/tickets/${t.ticket_number || t.id}`}
                className="block bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-300 transition-all overflow-hidden p-5 sm:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column: Number, Status, Subject */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {t.ticket_number}
                      </span>
                      <StatusBadge status={t.status} />
                      <CategoryBadge category={t.category} />
                      <PriorityBadge priority={t.priority} />

                      {t.book_title && t.book_title !== "General / Account Level" && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          <BookOpen className="h-3 w-3 text-teal-600" />
                          {t.book_title}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {t.subject}
                    </h3>

                    {/* Preview of latest message */}
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                      <span className="font-semibold text-slate-800">
                        {lastMsg ? `${lastMsg.sender_name}: ` : "Query: "}
                      </span>
                      {lastMsg?.content || t.description}
                    </p>
                  </div>

                  {/* Right Column: Timestamps & Replies count */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs text-slate-500 min-w-[150px]">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(t.updated_at || t.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasAdminReply ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-[11px] border border-teal-200">
                          {t.messages.length} messages
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px] border border-amber-200">
                          Awaiting Team Review
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-slate-400" />
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
