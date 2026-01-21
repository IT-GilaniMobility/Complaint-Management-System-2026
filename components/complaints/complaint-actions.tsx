"use client";

import { useState } from "react";
import { CheckCircle2, UserRoundSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Complaint, ComplaintStatus, User } from "@/lib/mock-data";

export function AssignDialog({
  open,
  complaint,
  users,
  onOpenChange,
  onAssign,
}: {
  open: boolean;
  complaint: Complaint | null;
  users: User[];
  onOpenChange: (open: boolean) => void;
  onAssign: (userId: string | null) => void;
}) {
  const [assignee, setAssignee] = useState<string>(complaint?.assignedTo ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign complaint</DialogTitle>
          <DialogDescription>Pick an agent or unassign to return to the queue.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Assignee</Label>
          <Select value={assignee || undefined} onValueChange={(value) => setAssignee(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} · {user.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onAssign(assignee || null)}>
            <UserRoundSearch className="mr-2 h-4 w-4" /> Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StatusDialog({
  open,
  complaint,
  onOpenChange,
  onChangeStatus,
}: {
  open: boolean;
  complaint: Complaint | null;
  onOpenChange: (open: boolean) => void;
  onChangeStatus: (status: ComplaintStatus) => void;
}) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint?.status ?? "In Progress");
  const statuses: ComplaintStatus[] = ["Pending", "Unassigned", "In Progress", "Resolved", "Closed"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change status</DialogTitle>
          <DialogDescription>Move the complaint to the next workflow state.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as ComplaintStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onChangeStatus(status)}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
