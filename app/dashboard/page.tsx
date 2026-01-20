import { ArrowUpRight, Calendar } from "lucide-react";

import { SummaryCards } from "@/components/complaints/summary-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { complaints } from "@/lib/mock-data";
import { complaintStatusLabel, formatDate, priorityColors, statusColors } from "@/lib/utils";

export default function DashboardPage() {
  const recent = [...complaints]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="flex-1 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Overview of complaint status and team performance
          </p>
        </div>
        <Button>+ New Complaint</Button>
      </div>

      {/* KPI Cards */}
      <SummaryCards complaints={complaints} />

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <p className="mt-1 text-sm text-slate-600">Latest complaints from all categories</p>
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
              {recent.map((complaint) => (
                <TableRow key={complaint.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">{complaint.number}</TableCell>
                  <TableCell className="text-slate-600">{complaint.categoryId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[complaint.priority]}>
                      {complaint.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[complaintStatusLabel(complaint)]}>
                      {complaintStatusLabel(complaint)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {complaint.assignedTo || <span className="text-slate-400">Unassigned</span>}
                  </TableCell>
                  <TableCell className="text-right text-slate-600 text-sm">
                    {formatDate(complaint.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
