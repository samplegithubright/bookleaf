"use client";

import React, { useState } from "react";
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
  ChevronDown, 
  Shield, 
  LogOut,
  Sparkles
} from "lucide-react";

const DEMO_USERS = [
  { name: "Priya Sharma (Author)", email: "priya.sharma@email.com", desc: "AUTH001 • Has Live Books & Pending Royalty" },
  { name: "Rohit Kapoor (Author)", email: "rohit.kapoor@email.com", desc: "AUTH002 • Tech/Business • Active ISBN Ticket" },
  { name: "Sneha Kulkarni (Author)", email: "sneha.kulkarni@email.com", desc: "AUTH007 • Has Book in Cover Design" },
  { name: "Kavita Deshmukh (Author)", email: "kavita.deshmukh@email.com", desc: "AUTH009 • Has Book in Typesetting" },
  { name: "BookLeaf Ops Admin", email: "admin@bookleaf.com", desc: "Internal Operations & AI Response Hub" }
];

export default function Navbar() {
  return (
    <React.Suspense fallback={<header className="bg-slate-900 border-b border-slate-800 h-16" />}>
      <NavbarContent />
    </React.Suspense>
  );
}

function NavbarContent() {
  const { user, quickSwitch, logout } = useAuth();
  const pathname = usePathname();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const isAdmin = user?.role === "admin";

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href={isAdmin ? "/admin/queue" : "/author/books"} className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  BookLeaf <span className="text-teal-400 text-xs px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800/80 font-medium">Portal</span>
                </span>
                <span className="text-[11px] block text-slate-400 leading-tight">
                  Author Support & Communication
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {!isAdmin ? (
                <>
                  <Link
                    href="/author/books"
                    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      pathname === "/author/books"
                        ? "bg-slate-800 text-teal-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    My Books
                  </Link>

                  <Link
                    href="/author/tickets"
                    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      pathname === "/author/tickets"
                        ? "bg-slate-800 text-teal-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    My Tickets
                  </Link>

                  <Link
                    href="/author/tickets/new"
                    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      pathname === "/author/tickets/new"
                        ? "bg-teal-600 text-white font-semibold"
                        : "bg-teal-600/20 text-teal-300 border border-teal-600/30 hover:bg-teal-600 hover:text-white"
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Submit Query
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/queue"
                    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      pathname.startsWith("/admin/queue") || pathname.startsWith("/admin/tickets")
                        ? "bg-slate-800 text-teal-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Ticket Queue
                  </Link>

                  <Link
                    href="/admin/authors"
                    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      pathname === "/admin/authors"
                        ? "bg-slate-800 text-teal-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Author Catalog
                  </Link>

                  <Link
                    href="/admin/analytics"
                    className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      pathname === "/admin/analytics"
                        ? "bg-slate-800 text-teal-400 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Controls: Quick Switcher & User Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSwitcher(!showSwitcher)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-all shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Switch Persona:</span>
                <span className="font-semibold text-teal-300 truncate max-w-[120px]">
                  {user?.name || "Select"}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showSwitcher && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowSwitcher(false)}
                >
                  <div className="px-3 py-2 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                    Interactive Evaluator Switcher
                  </div>
                  <div className="py-1">
                    {DEMO_USERS.map((demo) => (
                      <button
                        key={demo.email}
                        type="button"
                        onClick={async () => {
                          setShowSwitcher(false);
                          await quickSwitch(demo.email);
                        }}
                        className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-slate-800 transition-colors ${
                          user?.email === demo.email ? "bg-teal-950/60 border-l-2 border-teal-400" : ""
                        }`}
                      >
                        <span className="font-medium text-slate-200 flex items-center justify-between">
                          {demo.name}
                          {demo.email.includes("admin") && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950 border border-purple-800 text-purple-300">
                              Admin
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-400">{demo.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  isAdmin ? "bg-purple-900/60 text-purple-300 border border-purple-700" : "bg-teal-900/60 text-teal-300 border border-teal-700"
                }`}>
                  {isAdmin ? <Shield className="h-4 w-4" /> : user?.name?.slice(0, 2).toUpperCase() || "AU"}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-purple-400" : "bg-emerald-400"}`} />
                    {isAdmin ? "BookLeaf Operations" : `Author (${user?.author_id || "AUTH"})`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
