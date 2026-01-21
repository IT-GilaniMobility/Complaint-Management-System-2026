import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

import type {
  Complaint,
  ComplaintPriority,
  ComplaintStatus,
} from "./mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, dateFormat = "MMM d, yyyy") {
  const value = typeof date === "string" ? new Date(date) : date;
  return format(value, dateFormat);
}

export const statusColors: Record<ComplaintStatus | "Overdue", string> = {
  Pending: "bg-blue-100 text-blue-800 border-blue-200",
  Unassigned: "bg-slate-100 text-slate-800 border-slate-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Closed: "bg-slate-200 text-slate-800 border-slate-300",
  Overdue: "bg-rose-100 text-rose-800 border-rose-200",
};

export const priorityColors: Record<ComplaintPriority, string> = {
  Low: "bg-slate-100 text-slate-800 border-slate-200",
  Medium: "bg-sky-100 text-sky-800 border-sky-200",
  High: "bg-amber-100 text-amber-800 border-amber-200",
  Urgent: "bg-rose-100 text-rose-800 border-rose-200",
};

export function isOverdue(complaint: Complaint) {
  const due = new Date(complaint.slaDueAt).getTime();
  const now = Date.now();
  return due < now && complaint.status !== "Closed" && complaint.status !== "Resolved";
}

export function complaintStatusLabel(complaint: Complaint): ComplaintStatus | "Overdue" {
  return isOverdue(complaint) ? "Overdue" : complaint.status;
}
