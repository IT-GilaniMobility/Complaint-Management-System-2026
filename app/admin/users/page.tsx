"use client";

import { useState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { users as seedUsers, type UserRole } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

export default function AdminUsersPage() {
  const [rows, setRows] = useState(seedUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("Agent");

  const currentUser = rows.find((u) => u.id === editingId);

  const handleSave = () => {
    if (!editingId) return;
    setRows((prev) => prev.map((u) => (u.id === editingId ? { ...u, role } : u)));
    toast({ title: "Role updated", description: `New role: ${role}` });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Admin</p>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage who can access the console.</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-4 w-4" /> RBAC
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team members</CardTitle>
          <CardDescription>UI-only; changes are stored locally.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(user.id);
                        setRole(user.role);
                      }}
                    >
                      <UserCog className="mr-2 h-4 w-4" /> Edit role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit role</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>User</Label>
            <p className="text-sm font-medium">{currentUser?.name}</p>
            <Label className="mt-2">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Admin", "Lead Agent", "Agent", "Staff"] as UserRole[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
