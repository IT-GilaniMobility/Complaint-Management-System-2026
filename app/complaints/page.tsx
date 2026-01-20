"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";

import { AssignDialog, StatusDialog } from "@/components/complaints/complaint-actions";
import { ComplaintTable } from "@/components/complaints/complaint-table";
import { FilterBar, type ComplaintFilters } from "@/components/complaints/filter-bar";
import { SummaryCards, type SummaryKey } from "@/components/complaints/summary-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { categories, complaints as seedComplaints, users } from "@/lib/mock-data";
import { complaintStatusLabel, isOverdue } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const tabs: SummaryKey[] = ["Total", "Unassigned", "In Progress", "Resolved", "Closed"];

const initialFilters: ComplaintFilters = {
  search: "",
  status: "All",
  priority: "All",
  categoryId: "all",
  assigned: "all",
};

export default function ComplaintsPage() {
  const [rows, setRows] = useState(seedComplaints);
  const [filters, setFilters] = useState<ComplaintFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState<SummaryKey>("Total");
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((complaint) => {
      const matchesTab =
        activeTab === "Total" ||
        (activeTab === "Overdue" && isOverdue(complaint)) ||
        complaint.status === activeTab;

      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        complaint.number.toLowerCase().includes(searchTerm) ||
        complaint.subject.toLowerCase().includes(searchTerm) ||
        complaint.reporter.toLowerCase().includes(searchTerm);

      const matchesStatus =
        filters.status === "All" ||
        (filters.status === "Overdue" && isOverdue(complaint)) ||
        complaintStatusLabel(complaint) === filters.status;

      const matchesPriority = filters.priority === "All" || complaint.priority === filters.priority;
      const matchesCategory = filters.categoryId === "all" || complaint.categoryId === filters.categoryId;
      const matchesAssigned =
        filters.assigned === "all" ||
        (filters.assigned === "assigned" && !!complaint.assignedTo) ||
        (filters.assigned === "unassigned" && !complaint.assignedTo);

      const created = new Date(complaint.createdAt);
      const matchesDateFrom = !filters.dateFrom || created >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || created <= new Date(filters.dateTo);

      return (
        matchesTab &&
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesAssigned &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [rows, filters, activeTab]);

  const selectedAssign = rows.find((c) => c.id === assignTarget) ?? null;
  const selectedStatus = rows.find((c) => c.id === statusTarget) ?? null;

  const handleClear = () => {
    setFilters(initialFilters);
    setActiveTab("Total");
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: `${filteredRows.length} rows exported to CSV (simulated).`,
    });
  };

  const handleSummarySelect = (key: SummaryKey) => {
    setActiveTab(key);
    if (key === "Total") setFilters((prev) => ({ ...prev, status: "All" }));
    else if (key === "Overdue") setFilters((prev) => ({ ...prev, status: "Overdue" }));
    else setFilters((prev) => ({ ...prev, status: key }));
  };

  const handleAssign = (userId: string | null) => {
    if (!assignTarget) return;
    setRows((prev) =>
      prev.map((c) => (c.id === assignTarget ? { ...c, assignedTo: userId, status: userId ? c.status : "Unassigned" } : c))
    );
    setAssignTarget(null);
    toast({ title: "Assignment updated", description: userId ? "Assigned to agent" : "Complaint returned to queue" });
  };

  const handleStatus = (status: string) => {
    if (!statusTarget) return;
    setRows((prev) => prev.map((c) => (c.id === statusTarget ? { ...c, status: status as any } : c)));
    setStatusTarget(null);
    toast({ title: "Status changed", description: `Moved to ${status}` });
  };

  const showEmpty = !loading && filteredRows.length === 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Complaints</p>
          <h1 className="text-2xl font-bold">All complaints</h1>
          <p className="text-sm text-muted-foreground">Filter, assign, and update complaint statuses.</p>
        </div>
        <Button asChild>
          <Link href="/complaints/new">
            <Plus className="mr-2 h-4 w-4" /> Create complaint
          </Link>
        </Button>
      </div>

      <SummaryCards complaints={rows} active={activeTab} onSelect={handleSummarySelect} />

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as SummaryKey)} className="space-y-4">
        <TabsList className="flex w-full flex-wrap gap-2 bg-muted/70 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="flex-1 min-w-[120px]">
              {tab}
            </TabsTrigger>
          ))}
          <TabsTrigger value="Overdue" className="flex-1 min-w-[120px] text-destructive">
            Overdue
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <FilterBar
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onClear={handleClear}
        onExport={handleExport}
      />

      {showEmpty ? (
        <Card className="border-dashed bg-white/70">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>No complaints found</CardTitle>
                <CardDescription>Loosen your filters or create a new complaint.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/complaints/new">
                <Plus className="mr-2 h-4 w-4" /> Create complaint
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ComplaintTable
          data={filteredRows}
          categories={categories}
          users={users}
          loading={loading}
          onAssign={(c) => setAssignTarget(c.id)}
          onChangeStatus={(c) => setStatusTarget(c.id)}
        />
      )}

      <AssignDialog
        open={!!assignTarget}
        complaint={selectedAssign}
        users={users.filter((u) => u.role === "Agent" || u.role === "Lead Agent")}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        onAssign={handleAssign}
      />

      <StatusDialog
        open={!!statusTarget}
        complaint={selectedStatus}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        onChangeStatus={(status) => handleStatus(status)}
      />
    </div>
  );
}
