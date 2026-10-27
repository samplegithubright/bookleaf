"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Book, fetchApi } from "@/lib/api";
import { 
  BookOpen, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  MessageSquarePlus,
  ShoppingBag,
  Shield
} from "lucide-react";

export default function AuthorBooksPage() {
  const { user, isLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadBooks() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchApi<Book[]>("/books/my-books");
        setBooks(data);
      } catch (err: any) {
        console.error("Failed to load author books", err);
        setError(err.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [user, isLoading]);

  // Aggregate author stats
  const totalEarned = books.reduce((acc, b) => acc + (b.total_royalty_earned || 0), 0);
  const totalPaid = books.reduce((acc, b) => acc + (b.royalty_paid || 0), 0);
  const totalPending = books.reduce((acc, b) => acc + (b.royalty_pending || 0), 0);
  const totalCopies = books.reduce((acc, b) => acc + (b.total_copies_sold || 0), 0);

  if (isLoading || (loading && books.length === 0 && !error)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Loading your book catalog & royalty data...</p>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <BookOpen className="h-10 w-10 text-teal-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Sign In Required</h2>
          <p className="text-xs text-slate-500 mb-4">Please log in to access your published titles and royalties.</p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error && books.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-rose-200 p-8 shadow-sm">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Unable to Load Catalog</h2>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Retry
            </button>
            <Link
              href="/login"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Sign In Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Author Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              {user?.role === "admin"
                ? "Super Admin View (All Catalog Titles)"
                : `Author Account: ${user?.author_id || "AUTH"}`}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Author"}
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Track your published catalog, monitor real-time sales copies, and review your 80/20 royalty distributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === "admin" && (
              <Link
                href="/admin/queue"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-md transition-all"
              >
                <Shield className="h-4 w-4" />
                Super Admin Dashboard
              </Link>
            )}
            <Link
              href="/author/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm shadow-md transition-all"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Raise Support Ticket
            </Link>
            <Link
              href="/author/tickets"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              View My Tickets
            </Link>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700/40">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              Published Titles
              <BookOpen className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{books.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Across global distribution</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700/40">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              Total Copies Sold
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{totalCopies.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">Amazon, Flipkart & BookLeaf</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700/40">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              Total Royalty Earned
              <IndianRupee className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-1">₹{totalEarned.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">80% author share of net profit</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 border border-slate-700/40">
            <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
              Royalty Pending Payout
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-1">₹{totalPending.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400 mt-1">Disbursed quarterly within 45 days</div>
          </div>
        </div>
      </div>

      {/* Books List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Published Catalog</h2>
            <p className="text-sm text-slate-500">
              Details, pricing, distribution channels, and sales statistics for your books.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
            <p>Loading your book records from BookLeaf...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700">No books found</h3>
            <p className="text-sm text-slate-500">You do not have any published books associated with this account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {books.map((book) => {
              const isInProduction = book.status.toLowerCase().includes("production");

              return (
                <div
                  key={book.book_id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Book Main Information */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isInProduction 
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}>
                            {isInProduction ? <Layers className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                            {book.status}
                          </span>

                          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            ID: {book.book_id}
                          </span>

                          {book.genre && (
                            <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {book.genre}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          {book.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                          <div>
                            <span className="font-medium text-slate-700">ISBN:</span>{" "}
                            {book.isbn ? (
                              <span className="font-mono text-slate-800">{book.isbn}</span>
                            ) : (
                              <span className="italic text-slate-400">Assigned upon publication</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Published:</span>{" "}
                            {book.publication_date || "Pending release"}
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Print Partner:</span>{" "}
                            {book.print_partner || "Delhi Plant (In-House)"}
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/author/tickets/new?book_id=${book.book_id}&title=${encodeURIComponent(book.title)}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
                        >
                          <MessageSquarePlus className="h-3.5 w-3.5" />
                          Raise Query for this Book
                        </Link>
                      </div>
                    </div>

                    {/* Edge-Case Banner for books in production */}
                    {isInProduction ? (
                      <div className="mt-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Book Currently in Production Pipeline: </span>
                          This title is actively moving through formatting and proof approval. Royalties and retailer distribution links will activate once the title status moves to Published & Live.
                        </div>
                      </div>
                    ) : (
                      /* Royalty & Sales Metrics Grid */
                      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] font-medium text-slate-500">Retail MRP</div>
                          <div className="text-base font-bold text-slate-900 mt-0.5">
                            {book.mrp ? `₹${book.mrp}` : "N/A"}
                          </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] font-medium text-slate-500">Royalty / Copy</div>
                          <div className="text-base font-bold text-teal-700 mt-0.5">
                            {book.author_royalty_per_copy ? `₹${book.author_royalty_per_copy}` : "N/A"}
                          </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] font-medium text-slate-500">Copies Sold</div>
                          <div className="text-base font-bold text-slate-900 mt-0.5">
                            {book.total_copies_sold.toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] font-medium text-slate-500">Total Royalty Earned</div>
                          <div className="text-base font-bold text-slate-900 mt-0.5">
                            ₹{book.total_royalty_earned.toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                          <div className="text-[11px] font-medium text-slate-500">Royalty Paid</div>
                          <div className="text-base font-bold text-emerald-700 mt-0.5">
                            ₹{book.royalty_paid.toLocaleString()}
                          </div>
                        </div>

                        <div className={`rounded-xl p-3 border ${
                          book.royalty_pending > 0 
                            ? "bg-amber-50/60 border-amber-200" 
                            : "bg-slate-50/80 border-slate-100"
                        }`}>
                          <div className="text-[11px] font-medium text-slate-500">Royalty Pending</div>
                          <div className={`text-base font-bold mt-0.5 ${
                            book.royalty_pending > 0 ? "text-amber-700" : "text-slate-700"
                          }`}>
                            ₹{book.royalty_pending.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Available on channels */}
                    {book.available_on && book.available_on.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700 flex items-center gap-1">
                            <ShoppingBag className="h-3.5 w-3.5 text-teal-600" />
                            Live Channels:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {book.available_on.map((store) => (
                              <span
                                key={store}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {store}
                              </span>
                            ))}
                          </div>
                        </div>

                        {book.last_royalty_payout_date && (
                          <div className="text-slate-400">
                            Last Payout Disbursed: <span className="font-medium text-slate-600">{book.last_royalty_payout_date}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
