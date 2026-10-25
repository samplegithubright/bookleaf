"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { 
  Users, 
  Search, 
  BookOpen, 
  IndianRupee, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight,
  TrendingUp,
  Layers
} from "lucide-react";

interface AuthorRecord {
  id: string;
  author_id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  joined_date?: string;
  total_books: number;
  total_earnings: number;
  total_pending_royalty: number;
  books: any[];
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAuthor, setExpandedAuthor] = useState<string | null>("AUTH001");

  useEffect(() => {
    async function loadAuthors() {
      try {
        setLoading(true);
        const data = await fetchApi<AuthorRecord[]>("/authors");
        setAuthors(data);
      } catch (err) {
        console.error("Failed to load authors", err);
      } finally {
        setLoading(false);
      }
    }
    loadAuthors();
  }, []);

  const filteredAuthors = authors.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q)) ||
      a.author_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Author Catalog & Accounts Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Registered BookLeaf authors and published bibliography from the sample dataset.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search authors, cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-3" />
          <p>Loading authors catalog...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAuthors.map((author) => {
            const isExpanded = expandedAuthor === author.author_id;

            return (
              <div
                key={author.author_id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
              >
                {/* Author Summary Bar */}
                <div
                  onClick={() => setExpandedAuthor(isExpanded ? null : author.author_id)}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-200 flex-shrink-0">
                      {author.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{author.name}</h3>
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                          {author.author_id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {author.email}
                        </span>
                        {author.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {author.city}
                          </span>
                        )}
                        {author.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {author.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 text-xs border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 block">Catalog</span>
                      <span className="font-bold text-slate-800">{author.books.length} Books</span>
                    </div>

                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 block">Royalty Earned</span>
                      <span className="font-bold text-teal-700">₹{author.total_earnings.toLocaleString()}</span>
                    </div>

                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 block">Pending Payout</span>
                      <span className={`font-bold ${author.total_pending_royalty > 0 ? "text-amber-600" : "text-slate-500"}`}>
                        ₹{author.total_pending_royalty.toLocaleString()}
                      </span>
                    </div>

                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {/* Expanded Books List */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-5 border-t border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Published Books & Titles in Pipeline:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {author.books.map((b) => {
                        const isInProd = b.status.toLowerCase().includes("production");

                        return (
                          <div
                            key={b.book_id}
                            className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-[10px] text-slate-400 block">{b.book_id}</span>
                                <span className="font-bold text-slate-900 text-sm">{b.title}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isInProd
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                {b.status}
                              </span>
                            </div>

                            <div className="text-slate-500 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                              <span>ISBN: <strong className="text-slate-700">{b.isbn || "Pending"}</strong></span>
                              <span>Genre: <strong className="text-slate-700">{b.genre || "N/A"}</strong></span>
                            </div>

                            {!isInProd && (
                              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block">Sold</span>
                                  <span className="font-semibold text-slate-800">{b.total_copies_sold}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">Earned</span>
                                  <span className="font-semibold text-teal-700">₹{b.total_royalty_earned}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">Pending</span>
                                  <span className="font-semibold text-amber-600">₹{b.royalty_pending}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
