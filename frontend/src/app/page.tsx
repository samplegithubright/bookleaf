"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Globe2,
  Clock,
  Layers,
  Award,
  Building2,
  Mail,
  MapPin,
  ChevronRight,
  LogIn,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="bg-white text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* SECTION 1: HERO & COMPANY MISSION */}
      <section id="about" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/40 via-white to-slate-50/50 pointer-events-none" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>BookLeaf Publishing • India&apos;s Leading Author-First Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              India&apos;s Author-First <br className="hidden sm:inline" />
              <span className="text-teal-600">Hybrid Publishing</span> House
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              BookLeaf Publishing empowers independent writers and established authors worldwide.
              With cutting-edge print-on-demand technology, transparent 80/20 royalties, and AI-assisted 48-hour SLA support, we scale author careers across 22,000+ catalog titles.
            </p>

            {/* Hero Action Buttons */}
            <div className="pt-4 flex items-center justify-center">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-xl shadow-teal-600/25 transition-all hover:-translate-y-0.5"
              >
                <LogIn className="h-4 w-4" />
                <span>Customer / Author Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Quick Metrics Banner */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">22,000+</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Catalog Titles Published</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">1,200+</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Monthly New Releases</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">80%</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Author Royalty Guarantee</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-700">48-Hr</div>
                <div className="text-xs font-medium text-slate-500 mt-1">Support Resolution SLA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CORE PUBLISHING SERVICES & VALUE PILLARS */}
      <section id="services" className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              Company Services
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              End-to-End Publishing & Author Operations
            </h2>
            <p className="text-sm text-slate-600">
              Everything an author needs to transform raw manuscripts into bestsellers, supported by dedicated publishing professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1: Global Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Print-on-Demand & Global Distribution
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless multi-channel distribution across Amazon, Flipkart, Kindle Direct Publishing, and international channels powered by our industrial printing partnership with Repro India Ltd.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>Paperback, Hardcover & eBook formatting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>Official ISBN assignment & barcode generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                  <span>Zero warehousing inventory holding costs</span>
                </li>
              </ul>
            </div>

            {/* Service 2: Transparent 80/20 Royalties */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Transparent 80/20 Author Royalties
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                BookLeaf operates on an industry-leading revenue-sharing model where authors retain 80% of net profits on every book sold, calculated with total clarity and zero hidden deductions.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Transparent MRP & print cost breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Monthly sales audits & quarterly bank transfers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Live royalty tracking in Customer Dashboard</span>
                </li>
              </ul>
            </div>

            {/* Service 3: AI-Assisted Support SLA */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                48-Hour SLA Dedicated Author Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authors never wait in ambiguity. Our proprietary support engine uses AI auto-classification and Knowledge Base-grounded resolution to guarantee fast, empathetic assistance.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Direct ticket submission linked to book context</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Real-time live WebSocket chat updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Human ops review on every critical query</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: COMPANY TRACK RECORD & OPERATIONS DETAILS */}
      <section id="network" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              Company Track Record
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Publishing Scale & Infrastructure
            </h2>
            <p className="text-sm text-slate-600">
              Established operations, dedicated publishing hubs, and verified author success across India and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Facilities & Partner Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl">
              <div className="space-y-2">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  BookLeaf Operations Center
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Headquartered in New Delhi, India
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  BookLeaf Publishing manages editorial, typesetting, marketing, and royalty operations from our Delhi corporate center, coupled with on-demand printing and fulfillment facilities powered by Repro India.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Building2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Corporate Publishing Office</span>
                    <span className="text-slate-400">New Delhi, Delhi 110001, India</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <MapPin className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Fulfillment & Print Operations</span>
                    <span className="text-slate-400">Repro India Production & Logistics Network</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Official Author Support</span>
                    <span className="text-slate-400">support@bookleafpublishing.com • 24x7 Digital Desk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Operational Statistics & Quick Login CTA */}
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-5">
                <h4 className="text-base font-bold text-slate-900">
                  Why 22,000+ Authors Choose BookLeaf
                </h4>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>100% Retained Rights:</strong> Authors keep complete copyright and publishing rights to their creative work.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Automated Financial Ledger:</strong> Every rupee earned is accounted for with download-ready monthly financial summaries.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Real-Time Author Portal:</strong> Direct access to manage books, track copies sold, and get live help.</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <span>Sign In to Customer Dashboard</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
