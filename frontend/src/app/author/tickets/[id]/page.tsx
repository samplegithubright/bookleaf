"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Ticket, fetchApi, getWebSocketUrl } from "@/lib/api";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/TicketBadge";
import { 
  ArrowLeft, 
  Send, 
  User, 
  Shield, 
  BookOpen, 
  Clock, 
  Radio, 
  Paperclip,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function AuthorTicketDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading conversation...</div>}>
      <AuthorTicketDetailContent />
    </Suspense>
  );
}

function AuthorTicketDetailContent() {
  const params = useParams();
  const ticketId = params.id as string;
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const loadTicket = async () => {
    try {
      const data = await fetchApi<Ticket>(`/tickets/${ticketId}`);
      setTicket(data);
    } catch (err) {
      console.error("Failed to load ticket", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading || !user || !ticketId) return;
    loadTicket();
  }, [ticketId, user, isLoading]);

  useEffect(() => {
    // Setup WebSocket connection to this specific ticket
    if (ticket?.id) {
      const wsUrl = getWebSocketUrl(`/ws/ticket/${ticket.id}`);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "ticket_updated" || payload.event === "ticket_status_changed") {
            if (payload.ticket) {
              setTicket(payload.ticket);
            } else {
              loadTicket();
            }
          }
        } catch (e) {
          console.error("WS parse error", e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      return () => {
        ws.close();
      };
    }
  }, [ticket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    setSending(true);
    try {
      const updated = await fetchApi<Ticket>(`/tickets/${ticket.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: replyText.trim() }),
      });
      setTicket(updated);
      setReplyText("");
    } catch (err) {
      console.error("Failed to post reply", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
        <p>Loading conversation details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Ticket not found</h2>
        <Link href="/author/tickets" className="text-sm font-medium text-teal-600 hover:underline">
          Return to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button & Live status */}
      <div className="flex items-center justify-between">
        <Link
          href="/author/tickets"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Tickets
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              wsConnected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Radio className={`h-3 w-3 ${wsConnected ? "animate-pulse text-emerald-500" : ""}`} />
            {wsConnected ? "Real-time Live Sync Active" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Ticket Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <CategoryBadge category={ticket.category} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Created {new Date(ticket.created_at).toLocaleString()}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {ticket.subject}
          </h1>

          {ticket.book_title && ticket.book_title !== "General / Account Level" && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200">
              <BookOpen className="h-3.5 w-3.5 text-teal-600" />
              Referenced Book: <span className="font-semibold">{ticket.book_title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 px-1">
          Conversation History ({ticket.messages.length})
        </h2>

        <div className="space-y-4">
          {ticket.messages.map((msg, index) => {
            const isAdmin = msg.sender_role === "admin";

            return (
              <div
                key={msg.message_id || index}
                className={`flex gap-3 ${isAdmin ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                    isAdmin
                      ? "bg-purple-900 text-purple-200 border border-purple-700"
                      : "bg-teal-700 text-white border border-teal-600"
                  }`}
                >
                  {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm space-y-1.5 ${
                    isAdmin
                      ? "bg-white border border-slate-200 text-slate-800"
                      : "bg-gradient-to-br from-teal-700 to-teal-800 text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-xs font-medium">
                    <span className={isAdmin ? "text-purple-700 font-bold" : "text-teal-200"}>
                      {isAdmin ? `BookLeaf Support (${msg.sender_name})` : "You"}
                    </span>
                    <span className={`text-[10px] ${isAdmin ? "text-slate-400" : "text-teal-200/80"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 sm:p-5">
        <form onSubmit={handleSendReply} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Write a Reply
          </label>
          <textarea
            rows={3}
            placeholder="Type your follow-up or reply here..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-y"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Admin responses will appear here in real-time without refreshing.
            </span>
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {sending ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
