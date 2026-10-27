"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  MessageSquare,
  PlusCircle,
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Check if viewing admin routes
  const isAdminView = pathname.startsWith("/admin");

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 md:w-68 bg-slate-900 text-white border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out shadow-2xl md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link
            href={isAdminView ? "/admin/queue" : "/author/books"}
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                isAdminView
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/40 group-hover:bg-purple-500/30"
                  : "bg-teal-500/20 text-teal-400 border border-teal-500/40 group-hover:bg-teal-500/30"
              }`}
            >
              {isAdminView ? <Shield className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                BookLeaf
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    isAdminView
                      ? "bg-purple-950 text-purple-300 border border-purple-800/80"
                      : "bg-teal-950 text-teal-300 border border-teal-800/80"
                  }`}
                >
                  {isAdminView ? "Super Admin" : "Customer"}
                </span>
              </div>
              <span className="text-[11px] block text-slate-400 leading-tight">
                {isAdminView ? "Operations & AI Hub" : "Author Support Portal"}
              </span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dashboard Navigation Menu - LEFT SIDE ONLY */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation Section */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isAdminView ? "Super Admin Navigation" : "Customer Navigation"}
            </div>

            {isAdminView ? (
              // Super Admin Left Menu
              <>
                <Link
                  href="/admin/queue"
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    pathname.startsWith("/admin/queue") || pathname.startsWith("/admin/tickets")
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <div className="text-left flex-1">
                    <div>Ticket Queue</div>
                    <div className="text-[10px] opacity-75 font-normal">AI auto-classification & SLAs</div>
                  </div>
                </Link>

                <Link
                  href="/admin/authors"
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    pathname === "/admin/authors"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <div className="text-left flex-1">
                    <div>Author Catalog</div>
                    <div className="text-[10px] opacity-75 font-normal">22,000+ title directory</div>
                  </div>
                </Link>

                <Link
                  href="/admin/analytics"
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    pathname === "/admin/analytics"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  <div className="text-left flex-1">
                    <div>Analytics & SLAs</div>
                    <div className="text-[10px] opacity-75 font-normal">Metrics & resolution times</div>
                  </div>
                </Link>

                {user?.role === "author" && (
                  <Link
                    href="/author/books"
                    onClick={onClose}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600 hover:text-white transition-all mt-4"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-teal-400" />
                    <div className="text-left flex-1">
                      <div>Customer Portal</div>
                      <div className="text-[10px] opacity-75 font-normal">Switch to author view</div>
                    </div>
                  </Link>
                )}
              </>
            ) : (
              // Customer / Author Left Menu
              <>
                <Link
                  href="/author/books"
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    pathname === "/author/books"
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <div className="text-left flex-1">
                    <div>My Books</div>
                    <div className="text-[10px] opacity-75 font-normal">Sales & 80/20 royalties</div>
                  </div>
                </Link>

                <Link
                  href="/author/tickets"
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    pathname.startsWith("/author/tickets") && pathname !== "/author/tickets/new"
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="text-left flex-1">
                    <div>My Tickets</div>
                    <div className="text-[10px] opacity-75 font-normal">Active support queries</div>
                  </div>
                </Link>

                <Link
                  href="/author/tickets/new"
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mt-2 ${
                    pathname === "/author/tickets/new"
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                      : "bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500 hover:text-white"
                  }`}
                >
                  <PlusCircle className="h-4 w-4 shrink-0 text-teal-400" />
                  <div className="text-left flex-1">
                    <div>Submit Query</div>
                    <div className="text-[10px] opacity-80 font-normal">New author support ticket</div>
                  </div>
                </Link>

                {user?.role === "admin" && (
                  <Link
                    href="/admin/queue"
                    onClick={onClose}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all mt-4"
                  >
                    <Shield className="h-4 w-4 shrink-0 text-purple-400" />
                    <div className="text-left flex-1">
                      <div>Super Admin Dashboard</div>
                      <div className="text-[10px] opacity-75 font-normal">Switch to operations queue</div>
                    </div>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar Footer: User Profile, Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          {/* User Profile Card */}
          <div suppressHydrationWarning className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div suppressHydrationWarning className="flex items-center gap-2.5 min-w-0">
              <div
                suppressHydrationWarning
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  user?.role === "admin"
                    ? "bg-purple-900/80 text-purple-300 border border-purple-700"
                    : "bg-teal-900/80 text-teal-300 border border-teal-700"
                }`}
              >
                {user?.role === "admin" ? <Shield className="h-4 w-4" /> : user?.name?.slice(0, 2).toUpperCase() || "AU"}
              </div>
              <div suppressHydrationWarning className="min-w-0 text-left">
                <div suppressHydrationWarning className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || "User"}
                </div>
                <div suppressHydrationWarning className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                  <span
                    suppressHydrationWarning
                    className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                      user?.role === "admin" ? "bg-purple-400" : "bg-emerald-400"
                    }`}
                  />
                  <span suppressHydrationWarning className="truncate">
                    {user?.role === "admin" ? "Super Admin" : `Author (${user?.author_id || "AUTH"})`}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
