import { ArrowUpRight, Calendar, Bell } from "lucide-react";
import { redirect } from "next/navigation";

import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { NotificationsWidget } from "@/components/dashboard/notifications-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { complaintStatusLabel, formatDate, priorityColors, statusColors } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user || userError) {
    redirect('/login');
  }
  
  // Fetch recent complaints from database
  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(`
      *,
      category:categories(name),
      reporter:users!complaints_reporter_id_fkey(name),
      assigned:users!complaints_assigned_to_id_fkey(name)
    `)
    .order("created_at", { ascending: false })
    .limit(8);

  const recent = complaints || [];

  // Transform data for summary cards
  const complaintsForSummary = recent.map((c: any) => ({
    id: c.id,
    number: c.complaint_number,
    subject: c.subject,
    description: c.description,
    categoryId: c.category?.name || 'Unknown',
    priority: c.priority,
    status: c.status,
    reporter: c.reporter?.name || 'Unknown',
    assignedTo: c.assigned?.name || null,
    createdAt: c.created_at,
    resolvedAt: c.resolved_at,
    closedAt: c.closed_at,
    dueDate: c.due_date,
      slaDueAt: c.due_date, // Use due_date as slaDueAt
  }));

  return (
    <div className="flex-1 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of complaint status and team performance
          </p>
        </div>
        <Button>+ New Complaint</Button>
      </div>

      {/* KPI Cards (clickable, route into /complaints with status filter) */}
      <DashboardSummaryCards complaints={complaintsForSummary as any} />

      {/* Recent Notifications - Live updating client component */}
      <NotificationsWidget />

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">Latest complaints from all categories</p>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No complaints yet. Create your first complaint to get started.
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((complaint: any) => {
                  const mapped = complaintsForSummary.find((c: any) => c.id === complaint.id);
                  return (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.complaint_number}</TableCell>
                      <TableCell>{complaint.category?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColors[complaint.priority as keyof typeof priorityColors]}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[complaintStatusLabel(mapped!) as keyof typeof statusColors]}>
                          {complaintStatusLabel(mapped!)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {complaint.assigned?.name || <span className="text-muted-foreground">Unassigned</span>}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatDate(complaint.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
