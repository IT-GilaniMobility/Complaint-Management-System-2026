"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import type { Category } from "@/lib/mock-data";
import { complaintStatusLabel, isOverdue } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { updateComplaintAssigneeAction, updateComplaintStatusAction } from "@/app/actions/complaints";

const tabs: SummaryKey[] = ["Total", "Unassigned", "In Progress", "Resolved", "Closed"];

const initialFilters: ComplaintFilters = {
  search: "",
  status: "All",
  priority: "All",
  categoryId: "all",
  assigned: "all",
};

export default function ComplaintsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<ComplaintFilters>(initialFilters);
  const [activeTab, setActiveTab] = useState<SummaryKey>("Total");
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch complaints
      const { data: complaintsData } = await supabase
        .from("complaints")
        .select(`
          *,
          category:categories(id, name),
          reporter:users!complaints_reporter_id_fkey(id, name),
          assigned:users!complaints_assigned_to_id_fkey(id, name)
        `)
        .order("created_at", { ascending: false });

      // Fetch users
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name, email, role")
        .order("name");

      if (complaintsData) {
        const categoryMap = new Map<string, Category>();

        // Transform to match expected format and collect categories from DB
        const transformed = complaintsData.map((c: any) => {
          if (c.category) {
            if (!categoryMap.has(c.category.id)) {
              categoryMap.set(c.category.id, {
                id: c.category.id,
                name: c.category.name,
              });
            }
          }

          return {
            id: c.id,
            number: c.complaint_number,
            subject: c.subject,
            description: c.description,
            // Use the real category ID so table lookup works
            categoryId: c.category?.id || "unknown",
            priority: c.priority,
            status: c.status,
            reporter: c.reporter?.name || "Unknown",
            assignedTo: c.assigned?.name || null,
            createdAt: c.created_at,
            resolvedAt: c.resolved_at,
            closedAt: c.closed_at,
            dueDate: c.due_date,
            slaDueAt: c.due_date,
          };
        });

        setRows(transformed);
        setCategories(Array.from(categoryMap.values()));
      }

      if (usersData) {
        setUsers(usersData);
      }

      setLoading(false);
    };

    fetchData();
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

  const handleAssign = async (userId: string | null) => {
    if (!assignTarget) return;
    
    startTransition(async () => {
      try {
        const result = await updateComplaintAssigneeAction(assignTarget, userId);
        
        // Update with actual data from server
        if (result) {
          setRows((prev) =>
            prev.map((c) => 
              c.id === assignTarget 
                ? { ...c, assignedTo: result.assigned_to?.name || null, status: result.status } 
                : c
            )
          );
        }
        
        toast({ 
          title: "Assignment updated", 
          description: userId ? "Assigned to agent - email notification sent" : "Complaint returned to queue" 
        });
      } catch (error: any) {
        toast({ 
          title: "Assignment failed", 
          description: error.message || "Failed to update assignment",
          variant: "destructive"
        });
      } finally {
        setAssignTarget(null);
      }
    });
  };

  const handleStatus = async (status: string) => {
    if (!statusTarget) return;
    
    startTransition(async () => {
      try {
        await updateComplaintStatusAction(statusTarget, status as any);
        
        // Update local state
        setRows((prev) => prev.map((c) => (c.id === statusTarget ? { ...c, status: status as any } : c)));
        
        toast({ title: "Status changed", description: `Moved to ${status}` });
      } catch (error: any) {
        toast({ 
          title: "Status update failed", 
          description: error.message || "Failed to update status",
          variant: "destructive"
        });
      } finally {
        setStatusTarget(null);
      }
    });
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
        <Card className="border-dashed">
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
        users={users.filter((u) => u.role === "Agent" || u.role === "Lead Agent" || u.role === "Admin")}
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
