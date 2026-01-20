"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, CheckCircle2, UserRoundCheck } from "lucide-react";

import { AssignDialog, StatusDialog } from "@/components/complaints/complaint-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fetchComplaintById, fetchUsers } from "@/lib/supabase/queries";
import type { Database } from "@/lib/supabase/database.types";
import { complaintStatusLabel, formatDate, isOverdue, priorityColors, statusColors } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { updateComplaintAssigneeAction, updateComplaintStatusAction, createCommentAction } from "@/app/actions/complaints";

type ComplaintStatus = Database["public"]["Tables"]["complaints"]["Row"]["status"];

export default function ComplaintDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ticket, setTicket] = useState<any | null>(null);
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [localActivities, setLocalActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [publicMessage, setPublicMessage] = useState("");
  const [internalMessage, setInternalMessage] = useState("");
  const [isUpdatingStatus, startStatusTransition] = useTransition();
  const [isUpdatingAssignee, startAssignTransition] = useTransition();
  const [isAddingComment, startCommentTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchComplaintById(params.id);
        if (!data) {
          setNotFound(true);
          return;
        }

        const mapped = {
          id: data.id,
          number: data.complaint_number,
          subject: data.subject,
          description: data.description,
          reporter: data.reporter?.name || "Unknown",
          assignedTo: data.assigned_to?.id || null,
          assignedName: data.assigned_to?.name || "Unassigned",
          categoryId: data.category?.name || "Unknown",
          priority: data.priority,
          status: data.status,
          createdAt: data.created_at,
          slaDueAt: data.due_date,
        };

        setTicket(mapped);
        setLocalComments(
          (data.comments || []).map((c: any) => ({
            id: c.id,
            complaintId: data.id,
            authorId: c.user?.name || "Unknown",
            type: (c.type as "public" | "internal") || "public",
            message: c.message,
            createdAt: c.created_at,
          }))
        );
        setLocalActivities(
          (data.activities || []).map((a: any) => ({
            id: a.id,
            complaintId: data.id,
            message: a.message,
            createdAt: a.created_at,
            type: a.type || "status",
          }))
        );
      } catch (err) {
        console.error("Failed to load complaint", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data || []))
      .catch((err) => console.error("Failed to load users", err));
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading complaint…</p>;
  }

  if (notFound || !ticket) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Complaint not found</h1>
        <p className="text-muted-foreground">The complaint you are looking for does not exist.</p>
        <Button onClick={() => router.push("/complaints")}>Back to list</Button>
      </div>
    );
  }

  const assignee = ticket.assignedName ?? "Unassigned";

  const addActivity = (message: string, type: "status" | "assignment" | "comment" | "note") => {
    setLocalActivities((prev) => [
      { id: crypto.randomUUID(), complaintId: ticket.id, message, createdAt: new Date().toISOString(), type },
      ...prev,
    ]);
  };

  const handleAddComment = (type: "public" | "internal") => {
    const body = type === "public" ? publicMessage.trim() : internalMessage.trim();
    if (!body) return;
    
    startCommentTransition(async () => {
      try {
        await createCommentAction(ticket.id, body, type === "internal");
        
        // Add to local state optimistically
        setLocalComments((prev) => [
          {
            id: crypto.randomUUID(),
            complaintId: ticket.id,
            authorId: "You",
            type,
            message: body,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        addActivity(`New ${type} comment added`, "comment");
        toast({ title: "Comment added", description: "Saved successfully." });
        type === "public" ? setPublicMessage("") : setInternalMessage("");
      } catch (err: any) {
        console.error(err);
        toast({ title: "Failed to add comment", description: err?.message ?? "Unexpected error", variant: "destructive" });
      }
    });
  };

  const handleAssign = (userId: string | null) => {
    if (!ticket) return;
    startAssignTransition(async () => {
      try {
        const updated: any = await updateComplaintAssigneeAction(ticket.id, userId);
        setTicket((prev: any) => ({
          ...prev,
          assignedTo: updated.assigned_to_id,
          assignedName: (updated as any).assigned_to?.name || (userId ? "Assigned" : "Unassigned"),
        }));
        addActivity(userId ? "Assigned to new owner" : "Unassigned back to queue", "assignment");
        toast({ title: "Assignment updated" });
      } catch (err: any) {
        console.error(err);
        toast({ title: "Failed to update assignee", description: err?.message ?? "Unexpected error", variant: "destructive" });
      } finally {
        setAssignOpen(false);
      }
    });
  };

  const handleStatus = (status: ComplaintStatus) => {
    if (!ticket) return;
    startStatusTransition(async () => {
      try {
        const updated: any = await updateComplaintStatusAction(ticket.id, status);
        setTicket((prev: any) => ({ ...prev, status: updated.status }));
        addActivity(`Status changed to ${status}`, "status");
        toast({ title: "Status changed", description: status });
      } catch (err: any) {
        console.error(err);
        toast({ title: "Failed to change status", description: err?.message ?? "Unexpected error", variant: "destructive" });
      } finally {
        setStatusOpen(false);
      }
    });
  };

  const statusLabel = complaintStatusLabel(ticket);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/complaints")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm font-semibold text-primary">Complaint {ticket.number}</p>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <p className="text-sm text-muted-foreground">Reported by {ticket.reporter}</p>
          </div>
        </div>
        <Badge className={statusColors[statusLabel] + " border"}>{statusLabel}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>{ticket.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Priority</p>
                <Badge className={priorityColors[ticket.priority] + " border mt-1"}>{ticket.priority}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Assignee</p>
                <p className="font-medium">{assignee}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">SLA Due</p>
                <p className="font-medium">{formatDate(ticket.slaDueAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{ticket.categoryId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className={statusColors[statusLabel] + " border mt-1"}>{statusLabel}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
              <CardDescription>Recent changes and comments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {localActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
              {localActivities.length === 0 && <p className="text-sm text-muted-foreground">No activity logged yet.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Public replies and internal notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="public" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="public">Public</TabsTrigger>
                  <TabsTrigger value="internal">Internal notes</TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="space-y-3">
                  <Textarea
                    placeholder="Reply to the customer"
                    value={publicMessage}
                    onChange={(e) => setPublicMessage(e.target.value)}
                  />
                  <Button onClick={() => handleAddComment("public")} disabled={isAddingComment}>
                    {isAddingComment ? "Saving..." : "Send reply"}
                  </Button>
                  <Separator />
                  {localComments
                    .filter((c) => c.type === "public")
                    .map((comment) => (
                      <div key={comment.id} className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>By {comment.authorId}</span>
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm">{comment.message}</p>
                      </div>
                    ))}
                  {localComments.filter((c) => c.type === "public").length === 0 && (
                    <p className="text-sm text-muted-foreground">No public comments yet.</p>
                  )}
                </TabsContent>

                <TabsContent value="internal" className="space-y-3">
                  <Textarea
                    placeholder="Add an internal note"
                    value={internalMessage}
                    onChange={(e) => setInternalMessage(e.target.value)}
                  />
                  <Button variant="secondary" onClick={() => handleAddComment("internal")} disabled={isAddingComment}>
                    {isAddingComment ? "Saving..." : "Save note"}
                  </Button>
                  <Separator />
                  {localComments
                    .filter((c) => c.type === "internal")
                    .map((comment) => (
                      <div key={comment.id} className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>By {comment.authorId}</span>
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm">{comment.message}</p>
                      </div>
                    ))}
                  {localComments.filter((c) => c.type === "internal").length === 0 && (
                    <p className="text-sm text-muted-foreground">No internal notes yet.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>State and SLA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge className={statusColors[statusLabel] + " border"}>{statusLabel}</Badge>
              <div className="rounded-lg bg-muted/60 p-3 text-sm">
                <p className="font-semibold">SLA due {formatDate(ticket.slaDueAt)}</p>
                <p className="text-muted-foreground">{isOverdue(ticket) ? "Overdue" : "Within target"}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setAssignOpen(true)} disabled={isUpdatingAssignee}>
                  <UserRoundCheck className="mr-2 h-4 w-4" /> Assign
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setStatusOpen(true)} disabled={isUpdatingStatus}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Status
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Update without leaving the page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => setAssignOpen(true)} disabled={isUpdatingAssignee}>
                Reassign owner
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setStatusOpen(true)} disabled={isUpdatingStatus}>
                Change status
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => handleAddComment("internal")} disabled={isAddingComment}>Add quick note</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
              <CardDescription>Reporter details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Reporter</p>
                <p className="font-medium">{ticket.reporter}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assignee</p>
                <p className="font-medium">{assignee}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Complaint ID</p>
                <p className="font-medium">{ticket.number}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignDialog
        open={assignOpen}
        complaint={ticket}
        users={users.filter((u) => u.role === "Agent" || u.role === "Lead Agent")}
        onOpenChange={setAssignOpen}
        onAssign={handleAssign}
      />

      <StatusDialog
        open={statusOpen}
        complaint={ticket}
        onOpenChange={setStatusOpen}
        onChangeStatus={(status) => handleStatus(status)}
      />
    </div>
  );
}
