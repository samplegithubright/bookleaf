"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Book, fetchApi } from "@/lib/api";
import { 
  Send, 
  Paperclip, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  ArrowLeft,
  CheckCircle,
  FileText
} from "lucide-react";
import Link from "next/link";

function SubmitTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const preselectedBookId = searchParams.get("book_id") || "General / Account Level";

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState(preselectedBookId);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await fetchApi<Book[]>("/books/my-books");
        setBooks(data);
      } catch (err) {
        console.error("Could not fetch books for dropdown", err);
      }
    }
    loadBooks();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError("Please fill in both the subject line and detailed query description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Find book title if selected
      const chosenBook = books.find((b) => b.book_id === selectedBook);
      const bookTitle = chosenBook ? chosenBook.title : "General / Account Level";

      const payload = {
        book_id: selectedBook,
        book_title: bookTitle,
        subject,
        description,
        attachment_name: attachment ? attachment.name : null,
      };

      const result = await fetchApi<{ id: string; ticket_number: string }>(
        "/tickets",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      // Successfully created ticket with AI auto-classification!
      router.push(`/author/tickets/${result.ticket_number || result.id}`);
    } catch (err: any) {
      console.error("Ticket submission failed", err);
      setError(err.message || "Failed to submit ticket. Please check your connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/author/tickets" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to My Tickets
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            AI-Assisted Operations Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Submit a Support Query
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Our author operations team will review your query. Inquiries are automatically prioritized and escalated according to BookLeaf publishing SLAs.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Unable to submit query: </span>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Book Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Select Book Related to this Query
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            >
              <option value="General / Account Level">General / Account Level Query (No Specific Book)</option>
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} (ID: {b.book_id} • Status: {b.status})
                </option>
              ))}
            </select>
            <p className="text-[12px] text-slate-500">
              Linking a book provides our operations desk with immediate sales records and printing status.
            </p>
          </div>

          {/* Subject Line */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Subject Line
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Haven't received Q3 royalty payout, or ISBN mismatch on Amazon India"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Detailed Query Description
            </label>
            <textarea
              required
              rows={6}
              placeholder="Please provide full details about your issue, dates, screenshots or platform URLs so our support desk can resolve it promptly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-y"
            />
          </div>

          {/* Optional File Attachment UI */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Attach Supporting Document or Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-slate-50/50">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachment(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Paperclip className="h-6 w-6 text-slate-400" />
                {attachment ? (
                  <div className="flex items-center gap-2 text-sm text-teal-700 font-medium">
                    <FileText className="h-4 w-4" />
                    <span>{attachment.name}</span>
                    <span className="text-xs text-slate-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-600 font-medium">
                      Drag & drop or click to upload photos of print defects, screenshots, or statements
                    </p>
                    <p className="text-[11px] text-slate-400">PNG, JPG, PDF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Knowledge Base Helper Notice */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
              BookLeaf Author Support Guidelines:
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-500">
              <li>Royalties are disbursed quarterly within 45 days after quarter close (min threshold ₹1,000).</li>
              <li>Damaged or defective author copies qualify for 100% free reprint after photo inspection.</li>
              <li>Catalog stock re-syncs for Amazon/Flipkart listings typically take 24–48 hours.</li>
            </ul>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/author/tickets"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Triaging with AI...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Support Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading form...</div>}>
      <SubmitTicketForm />
    </Suspense>
  );
}
