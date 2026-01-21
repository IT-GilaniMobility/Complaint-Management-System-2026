"use client";

import { AlertTriangle, BadgeCheck, Clock, Inbox, Loader2, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn, complaintStatusLabel, isOverdue } from "@/lib/utils";
import type { Complaint } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Total: Users,
  Unassigned: Inbox,
  "In Progress": Loader2,
  Resolved: ShieldCheck,
  Closed: BadgeCheck,
  Overdue: AlertTriangle,
};

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  Total: { bg: "bg-slate-50", text: "text-slate-900", icon: "text-slate-600" },
  Unassigned: { bg: "bg-blue-50", text: "text-blue-900", icon: "text-blue-600" },
  "In Progress": { bg: "bg-amber-50", text: "text-amber-900", icon: "text-amber-600" },
  Resolved: { bg: "bg-emerald-50", text: "text-emerald-900", icon: "text-emerald-600" },
  Closed: { bg: "bg-slate-50", text: "text-slate-900", icon: "text-slate-600" },
  Overdue: { bg: "bg-red-50", text: "text-red-900", icon: "text-red-600" },
};

export type SummaryKey = "Total" | "Pending" | "Unassigned" | "In Progress" | "Resolved" | "Closed" | "Overdue";

function buildCounts(complaints: Complaint[]) {
  const counts: Record<SummaryKey, number> = {
    Total: complaints.length,
    Unassigned: 0,
    "In Progress": 0,
    Resolved: 0,
    Closed: 0,
    Overdue: 0,
  };

  complaints.forEach((c) => {
    const statusKey = complaintStatusLabel(c);
    if (statusKey === "Overdue") counts.Overdue += 1;
    else counts[statusKey as Exclude<SummaryKey, "Total">] += 1;
  });

  return counts;
}

export function SummaryCards({
  complaints,
  active,
  onSelect,
}: {
  complaints: Complaint[];
  active?: SummaryKey | null;
  onSelect?: (key: SummaryKey) => void;
}) {
  const counts = buildCounts(complaints);

  const cards: { key: SummaryKey; label: string; helper: string }[] = [
    { key: "Total", label: "Total", helper: "All complaints" },
    { key: "Unassigned", label: "Unassigned", helper: "Awaiting assignment" },
    { key: "In Progress", label: "In Progress", helper: "Currently being worked" },
    { key: "Resolved", label: "Resolved", helper: "Awaiting confirmation" },
    { key: "Closed", label: "Closed", helper: "Completed" },
    { key: "Overdue", label: "Overdue", helper: "SLA breached" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ key, label, helper }) => {
        const Icon = iconMap[key];
        const isActive = active === key;
        const colors = colorMap[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(key)}
            className={cn(
              "text-left transition-colors group",
              onSelect && "hover:opacity-80 cursor-pointer",
              !onSelect && "cursor-default"
            )}
          >
            <Card className={cn("h-full", isActive && "ring-2 ring-indigo-500")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded", colors.bg)}>
                    <Icon className={cn("h-4 w-4", colors.icon)} />
                  </div>
                </div>
                <div className="text-2xl font-semibold">{counts[key]}</div>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
