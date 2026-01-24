"use client";

import { useRouter } from "next/navigation";

import { SummaryCards, type SummaryKey } from "@/components/complaints/summary-cards";
import type { Complaint } from "@/lib/mock-data";

export function DashboardSummaryCards({ complaints }: { complaints: Complaint[] }) {
  const router = useRouter();

  const handleSelect = (key: SummaryKey) => {
    const params = new URLSearchParams();

    // Mirror complaints page behavior: "Total" means all, others filter by status
    if (key !== "Total") {
      params.set("status", key);
    }

    const query = params.toString();
    router.push(`/complaints${query ? `?${query}` : ""}`);
  };

  return <SummaryCards complaints={complaints} onSelect={handleSelect} />;
}
