"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Ticket, Book, fetchApi } from "@/lib/api";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/TicketBadge";
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Shield, 
  User, 
  Clock, 
  Radio, 
  Edit3, 
  RefreshCw, 
  StickyNote, 
  CheckCircle, 
  BookOpen, 
  IndianRupee, 
  TrendingUp, 
  Sliders, 
  UserPlus,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";

const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry"
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export default function AdminTicketDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading ticket workspace...</div>}>
      <AdminTicketDetailContent />
    </Suspense>
  );
}

function AdminTicketDetailContent() {
  const params = useParams();
  const ticketId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [bookDetails, setBookDetails] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  // Response Editor State
  const [replyText, setReplyText] = useState("");
  const [newStatusOnReply, setNewStatusOnReply] = useState("In Progress");
  const [sendingReply, setSendingReply] = useState(false);

  // Internal Notes State
  const [internalNoteText, setInternalNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Custom AI draft instructions
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [regeneratingDraft, setRegeneratingDraft] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Management overrides
  const [statusVal, setStatusVal] = useState("");
  const [categoryVal, setCategoryVal] = useState("");
  const [priorityVal, setPriorityVal] = useState("");
  const [assignVal, setAssignVal] = useState("");
  const [savingOverrides, setSavingOverrides] = useState(false);

  // WebSocket
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await fetchApi<Ticket>(`/tickets/${ticketId}`);
      setTicket(data);
      setStatusVal(data.status);
      setCategoryVal(data.category);
      setPriorityVal(data.priority);
      setAssignVal(data.assigned_to || "");

      // If AI draft exists and editor is empty, we don't automatically overwrite, but user can click "Use Draft"
      if (data.book_id && data.book_id !== "General / Account Level") {
        try {
          const b = await fetchApi<Book>(`/books/${data.book_id}`);
          setBookDetails(b);
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Failed to load ticket", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  // WebSocket for real-time ticket sync
  useEffect(() => {
    if (ticket?.id) {
      const wsUrl = `ws://localhost:8000/api/v1/ws/ticket/${ticket.id}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => setWsConnected(true);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.ticket) {
            setTicket(payload.ticket);
            setStatusVal(payload.ticket.status);
            setCategoryVal(payload.ticket.category);
            setPriorityVal(payload.ticket.priority);
            setAssignVal(payload.ticket.assigned_to || "");
          }
        } catch (e) {
          console.error("WS parse error", e);
        }
      };

      ws.onclose = () => setWsConnected(false);

      return () => ws.close();
    }
  }, [ticket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  // Handle Send Admin Reply to Author
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;

    setSendingReply(true);
    try {
      const updated = await fetchApi<Ticket>(`/tickets/${ticket.id}/reply`, {
        method: "POST",
        body: JSON.stringify({
          message: replyText.trim(),
          new_status: newStatusOnReply,
        }),
      });
      setTicket(updated);
      setReplyText("");
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setSendingReply(false);
    }
  };

  // Handle Add Internal Note
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteText.trim() || !ticket) return;

    setAddingNote(true);
    try {
      const updated = await fetchApi<Ticket>(`/tickets/${ticket.id}/internal-notes`, {
        method: "POST",
        body: JSON.stringify({ content: internalNoteText.trim() }),
      });
      setTicket(updated);
      setInternalNoteText("");
    } catch (err) {
      console.error("Failed to add internal note", err);
    } finally {
      setAddingNote(false);
    }
  };

  // Handle AI Draft Regeneration
  const handleRegenerateDraft = async () => {
    if (!ticket) return;
    setRegeneratingDraft(true);
    try {
      const res = await fetchApi<{ draft_response: string }>(
        `/tickets/${ticket.id}/generate-ai-draft`,
        {
          method: "POST",
          body: JSON.stringify({ custom_instructions: customAiPrompt.trim() || null }),
        }
      );
      setTicket({ ...ticket, ai_draft_response: res.draft_response });
      setCustomAiPrompt("");
    } catch (err) {
      console.error("Failed to regenerate AI draft", err);
    } finally {
      setRegeneratingDraft(false);
    }
  };

  // Use Draft in Response Editor
  const handleUseDraftInEditor = () => {
    if (ticket?.ai_draft_response) {
      setReplyText(ticket.ai_draft_response);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
    }
  };

  // Save Management Overrides (Status, Category, Priority, Assignee)
  const handleSaveOverrides = async () => {
    if (!ticket) return;
    setSavingOverrides(true);
    try {
      const updated = await fetchApi<Ticket>(`/tickets/${ticket.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusVal,
          category: categoryVal,
          priority: priorityVal,
          assigned_to: assignVal,
        }),
      });
      setTicket(updated);
    } catch (err) {
      console.error("Failed to save overrides", err);
    } finally {
      setSavingOverrides(false);
    }
  };

  // Assign to Myself shortcut
  const handleAssignToMe = () => {
    if (user?.email) {
      setAssignVal(user.email);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
        <p>Loading ticket workspace...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Ticket not found</h2>
        <Link href="/admin/queue" className="text-sm font-medium text-teal-600 hover:underline">
          Return to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/queue"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {ticket.ticket_number}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {ticket.subject}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              wsConnected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Radio className={`h-3 w-3 ${wsConnected ? "animate-pulse text-emerald-500" : ""}`} />
            {wsConnected ? "Real-time Live Sync" : "Syncing..."}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Conversation & Response Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Conversation History */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
              <span>Author Conversation ({ticket.messages.length})</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Author: {ticket.author_name} ({ticket.author_email})
              </span>
            </h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {ticket.messages.map((msg, index) => {
                const isAdmin = msg.sender_role === "admin";

                return (
                  <div
                    key={msg.message_id || index}
                    className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                        isAdmin
                          ? "bg-purple-900 text-purple-200 border border-purple-700"
                          : "bg-teal-700 text-white border border-teal-600"
                      }`}
                    >
                      {isAdmin ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-sm space-y-1.5 ${
                        isAdmin
                          ? "bg-purple-950 text-purple-100 border border-purple-900"
                          : "bg-slate-50 border border-slate-200 text-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span className={`font-semibold ${isAdmin ? "text-purple-300" : "text-teal-700"}`}>
                          {isAdmin ? `BookLeaf Team (${msg.sender_name})` : msg.sender_name}
                        </span>
                        <span className={`text-[10px] ${isAdmin ? "text-purple-300/80" : "text-slate-400"}`}>
                          {new Date(msg.created_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

          {/* Admin Response Composer (Sends directly to author) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-teal-600" />
                Draft & Send Official Response to Author
              </h2>

              {ticket.ai_draft_response && (
                <button
                  type="button"
                  onClick={handleUseDraftInEditor}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors shadow-sm"
                >
                  {copiedDraft ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Sparkles className="h-3.5 w-3.5 text-purple-600" />}
                  {copiedDraft ? "Inserted Draft!" : "Insert AI Draft Below"}
                </button>
              )}
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <textarea
                rows={7}
                required
                placeholder="Review or edit the response before sending. The author will see this in real-time on their dashboard..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium">Set Ticket Status on Send:</span>
                  <select
                    value={newStatusOnReply}
                    onChange={(e) => setNewStatusOnReply(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="In Progress">Move to In Progress</option>
                    <option value="Resolved">Mark as Resolved</option>
                    <option value="Closed">Close Ticket</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {sendingReply ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Response to Author
                </button>
              </div>
            </form>
          </div>

          {/* Internal Operations Notes (Hidden from author) */}
          <div className="bg-amber-50/50 rounded-2xl border border-amber-200/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-amber-700" />
                Internal Operations Notes (Hidden from Author)
              </h2>
              <span className="text-[11px] font-medium text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                Team Visible Only
              </span>
            </div>

            {ticket.internal_notes.length > 0 ? (
              <div className="space-y-2.5">
                {ticket.internal_notes.map((note) => (
                  <div
                    key={note.note_id}
                    className="bg-white rounded-xl p-3 border border-amber-200/70 shadow-2xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-amber-900 font-semibold">
                      <span>{note.admin_name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-normal">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-800/80 italic">
                No internal notes added yet. Use this section for banking UTRs, print plant coordination, or escalations.
              </p>
            )}

            <form onSubmit={handleAddInternalNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add team note (e.g. 'Reprint requested with Delhi plant manager')..."
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={addingNote || !internalNoteText.trim()}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {addingNote ? "Saving..." : "Add Note"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI Copilot & Management Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI-Drafted Response Card */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-slate-50 rounded-2xl border border-purple-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-950">
                    BookLeaf AI Copilot Draft
                  </h3>
                  <span className="text-[11px] text-purple-700">
                    Grounded in Knowledge Base & Author Data
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUseDraftInEditor}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
              >
                <Copy className="h-3 w-3" />
                Use in Editor
              </button>
            </div>

            {ticket.ai_draft_response ? (
              <div className="bg-white rounded-xl p-3.5 border border-purple-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {ticket.ai_draft_response}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-purple-50/50 text-center text-xs text-purple-700">
                Draft response not yet generated.
              </div>
            )}

            {/* Custom Regeneration Instructions */}
            <div className="space-y-2 pt-2 border-t border-purple-100">
              <label className="block text-[11px] font-semibold text-purple-900">
                Regenerate AI Draft with Custom Instructions:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 'be shorter', 'mention 100% free reprint'..."
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleRegenerateDraft}
                  disabled={regeneratingDraft}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${regeneratingDraft ? "animate-spin" : ""}`} />
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* AI Auto-Classification & Priority Management Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-teal-600" />
                Ticket Classification & Overrides
              </span>
              <span className="text-[11px] font-normal text-slate-400">Admin Controls</span>
            </h3>

            {/* AI Auto-Classification with Override */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Category (AI: {ticket.ai_category || "Detected"})
                </label>
                {ticket.category !== ticket.ai_category && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Admin Overridden
                  </span>
                )}
              </div>
              <select
                value={categoryVal}
                onChange={(e) => setCategoryVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* AI-Generated Priority Score with Override */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Priority Score (AI: {ticket.ai_priority || "Detected"})
                </label>
                {ticket.priority !== ticket.ai_priority && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Admin Overridden
                  </span>
                )}
              </div>
              <select
                value={priorityVal}
                onChange={(e) => setPriorityVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Ticket Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Ticket Status</label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Ticket Assignment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Assigned Admin</label>
                <button
                  type="button"
                  onClick={handleAssignToMe}
                  className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                >
                  Assign to Me
                </button>
              </div>
              <input
                type="email"
                placeholder="Admin email (e.g. admin@bookleaf.com)"
                value={assignVal}
                onChange={(e) => setAssignVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Save Overrides Button */}
            <button
              type="button"
              onClick={handleSaveOverrides}
              disabled={savingOverrides}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {savingOverrides ? "Saving..." : "Save Classification & Status Changes"}
            </button>
          </div>

          {/* Author & Book Context Information */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-teal-600" />
              Author Context ({ticket.author_id})
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Author Name:</span>
                <span className="font-semibold text-slate-900">{ticket.author_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <span className="font-mono text-slate-800">{ticket.author_email}</span>
              </div>
            </div>

            {bookDetails ? (
              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-teal-600" />
                  {bookDetails.title}
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="font-semibold text-slate-800">{bookDetails.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Copies Sold</span>
                    <span className="font-semibold text-slate-800">{bookDetails.total_copies_sold}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Royalty Earned</span>
                    <span className="font-semibold text-teal-700">₹{bookDetails.total_royalty_earned}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Royalty Pending</span>
                    <span className="font-semibold text-amber-700">₹{bookDetails.royalty_pending}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Print Partner: <span className="font-medium text-slate-700">{bookDetails.print_partner || "In-House"}</span>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 italic">
                General account level query (No single book linked).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
