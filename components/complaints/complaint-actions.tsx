"use client";

import { useState } from "react";
import { CheckCircle2, UserRoundSearch, StickyNote, Mail, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

export function QuickNoteDialog({
  open,
  onOpenChange,
  onSaveNote,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveNote: (note: string) => void;
  isLoading?: boolean;
}) {
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (note.trim()) {
      onSaveNote(note.trim());
      setNote("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add quick note</DialogTitle>
          <DialogDescription>Add an internal note to this complaint.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Note</Label>
          <Textarea
            placeholder="Enter your internal note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!note.trim() || isLoading}>
            <StickyNote className="mr-2 h-4 w-4" /> {isLoading ? "Saving..." : "Save note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SendEmailDialog({
  open,
  complaint,
  onOpenChange,
  onSendEmail,
  isLoading,
}: {
  open: boolean;
  complaint: { number: string; subject: string } | null;
  onOpenChange: (open: boolean) => void;
  onSendEmail: (toEmail: string, subject: string, message: string) => void;
  isLoading?: boolean;
}) {
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Pre-fill subject when complaint changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && complaint) {
      setSubject(`Re: ${complaint.subject} [#${complaint.number}]`);
    }
    onOpenChange(isOpen);
  };

  const handleSend = () => {
    if (toEmail.trim() && subject.trim() && message.trim()) {
      onSendEmail(toEmail.trim(), subject.trim(), message.trim());
      setToEmail("");
      setSubject("");
      setMessage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send email</DialogTitle>
          <DialogDescription>Send an email related to this complaint.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>To</Label>
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!toEmail.trim() || !subject.trim() || !message.trim() || isLoading}
          >
            <Send className="mr-2 h-4 w-4" /> {isLoading ? "Sending..." : "Send email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
