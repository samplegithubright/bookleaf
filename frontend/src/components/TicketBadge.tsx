import React from "react";

export function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "Critical":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300">
          <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping inline-block" />
          Critical
        </span>
      );
    case "High":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
          High
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          Medium
        </span>
      );
    case "Low":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Low
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Open":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Open
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
          In Progress
        </span>
      );
    case "Resolved":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
          Resolved
        </span>
      );
    case "Closed":
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
          Closed
        </span>
      );
  }
}

export function CategoryBadge({ category }: { category: string }) {
  let color = "bg-slate-100 text-slate-700 border-slate-200";
  if (category.includes("Royalty")) {
    color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (category.includes("ISBN")) {
    color = "bg-purple-50 text-purple-700 border-purple-200";
  } else if (category.includes("Printing")) {
    color = "bg-orange-50 text-orange-700 border-orange-200";
  } else if (category.includes("Distribution")) {
    color = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (category.includes("Status") || category.includes("Production")) {
    color = "bg-indigo-50 text-indigo-700 border-indigo-200";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {category}
    </span>
  );
}
