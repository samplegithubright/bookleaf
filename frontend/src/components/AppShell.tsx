"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import {
  Menu,
  X,
  BookOpen,
  Shield,
  ArrowRight,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingPage = pathname === "/";
  const isAdminLoginPage = pathname === "/admin";
  const isLoginPage = pathname === "/login" || isAdminLoginPage;
  const isDashboard =
    (pathname.startsWith("/author") || pathname.startsWith("/admin")) &&
    pathname !== "/admin";
  const isAdminView = pathname.startsWith("/admin");

  // Determine current page title for dashboard topbar
  const getPageTitle = () => {
    if (pathname === "/author/books") return "Customer Dashboard • My Books & Royalties";
    if (pathname === "/author/tickets") return "Customer Dashboard • My Support Queries";
    if (pathname === "/author/tickets/new") return "Customer Dashboard • Submit Support Query";
    if (pathname.startsWith("/author/tickets/")) return "Customer Dashboard • Ticket Communication";
    if (pathname.startsWith("/admin/queue")) return "Super Admin Dashboard • Ticket Queue";
    if (pathname === "/admin/authors") return "Super Admin Dashboard • Author Catalog";
    if (pathname === "/admin/analytics") return "Super Admin Dashboard • SLA & Analytics";
    if (pathname.startsWith("/admin/tickets/")) return "Super Admin Dashboard • AI Copilot Workspace";
    return isAdminView ? "Super Admin Dashboard" : "Customer Dashboard";
  };

  // Case 1: Landing Page (Public Header with Login Button, 2-3 Sections, Public Footer)
  if (isLandingPage) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* Landing Page Header with Login Button */}
        <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/30 transition-all shrink-0">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-base sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
                    BookLeaf <span className="text-teal-400 font-semibold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800/80">Publishing</span>
                  </div>
                  <span className="hidden sm:block text-[11px] text-slate-400 leading-tight">
                    Global Author Support & Publishing Operations
                  </span>
                </div>
              </Link>

              {/* Navigation & Header Login Button */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="hidden lg:flex items-center gap-6 text-sm text-slate-300 font-medium mr-2">
                  <a href="#about" className="hover:text-teal-400 transition-colors">About BookLeaf</a>
                  <a href="#services" className="hover:text-teal-400 transition-colors">Publishing Services</a>
                  <a href="#network" className="hover:text-teal-400 transition-colors">Track Record</a>
                </div>

                {user ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Link
                      href={user.role === "admin" ? "/admin/queue" : "/author/books"}
                      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-teal-600/25 transition-all"
                    >
                      <span className="truncate max-w-[130px] sm:max-w-none">
                        {user.role === "admin" ? "Super Admin Dashboard" : "Customer Dashboard"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      title="Log Out"
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
                  >
                    <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span>Customer Login</span>
                  </Link>
                )}

                {/* Mobile hamburger menu toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {mobileMenuOpen && (
              <div className="lg:hidden py-3 border-t border-slate-800 space-y-1">
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                >
                  About BookLeaf
                </a>
                <a
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                >
                  Publishing Services
                </a>
                <a
                  href="#network"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-teal-400 transition-colors"
                >
                  Track Record
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Landing Page Content */}
        <main className="flex-1">{children}</main>

        {/* Public Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-slate-200">BookLeaf Publishing</span>
              <span>• Author Operations Center (Delhi & Repro India)</span>
            </div>
            <div className="text-slate-500 text-center sm:text-right">
              80/20 Transparent Royalty Guarantee • 48-Hour Priority SLA • Serving 22,000+ Authors
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Case 2: Login Page
  if (isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-slate-900 border-b border-slate-800 py-3 sm:py-4 px-4 sm:px-6 text-white flex items-center justify-between shadow-sm">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div
              className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0 ${
                isAdminLoginPage
                  ? "bg-purple-500/20 border border-purple-500/40 text-purple-400"
                  : "bg-teal-500/20 border border-teal-500/40 text-teal-400"
              }`}
            >
              {isAdminLoginPage ? <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
              BookLeaf
              <span
                className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${
                  isAdminLoginPage
                    ? "bg-purple-950 text-purple-300 border border-purple-800"
                    : "bg-teal-950 text-teal-300 border border-teal-800"
                }`}
              >
                {isAdminLoginPage ? "Super Admin" : "Customer Portal"}
              </span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-[11px] sm:text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <span>← <span className="hidden sm:inline">Back to Company </span>Website</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">{children}</main>
      </div>
    );
  }

  // Case 3: Dashboard Pages (/author/* and /admin/*)
  // EVERY MENU ON THE LEFT SIDE (SIDEBAR), NO MENU IN HEADER!
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar Menu */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area to the Right of Left Sidebar */}
      <div className="flex-1 md:pl-64 lg:pl-68 flex flex-col min-w-0 min-h-screen">
        {/* Minimal Top Header - NO MENU LINKS HERE, MENU IS ON THE LEFT */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Hamburger button for mobile only */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Current Page Title / Breadcrumb */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800 min-w-0">
              <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                  isAdminView ? "bg-purple-600" : "bg-teal-600"
                }`}
              />
              <span className="truncate">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right Header Status - Minimal info, no menu links */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System Online</span>
            </div>

            <div suppressHydrationWarning className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div
                suppressHydrationWarning
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  user?.role === "admin"
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : "bg-teal-100 text-teal-700 border border-teal-300"
                }`}
              >
                {user?.role === "admin" ? <Shield className="h-3.5 w-3.5" /> : user?.name?.slice(0, 2).toUpperCase() || "AU"}
              </div>
              <span suppressHydrationWarning className="hidden md:inline font-medium text-slate-700 text-xs truncate max-w-[120px]">
                {user?.name || "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
