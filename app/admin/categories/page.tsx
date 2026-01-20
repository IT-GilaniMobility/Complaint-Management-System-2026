"use client";

import { useState } from "react";
import { Pencil, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categories as seedCategories, type Category } from "@/lib/mock-data";
import { toast } from "@/components/ui/use-toast";

export default function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>(seedCategories);
  const [editing, setEditing] = useState<Category | null>(null);
  const [isDelete, setIsDelete] = useState<Category | null>(null);

  const [form, setForm] = useState({ name: "", description: "" });

  const openEditor = (category?: Category) => {
    setEditing(category ?? { id: "", name: "", description: "" });
    setForm({ name: category?.name ?? "", description: category?.description ?? "" });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Name required" });
      return;
    }
    if (editing && editing.id) {
      setRows((prev) => prev.map((c) => (c.id === editing.id ? { ...c, name: form.name, description: form.description } : c)));
      toast({ title: "Category updated" });
    } else {
      const newCategory: Category = {
        id: `cat-${crypto.randomUUID().slice(0, 6)}`,
        name: form.name,
        description: form.description,
      };
      setRows((prev) => [newCategory, ...prev]);
      toast({ title: "Category added" });
    }
    setEditing(null);
  };

  const handleDelete = () => {
    if (!isDelete) return;
    setRows((prev) => prev.filter((c) => c.id !== isDelete.id));
    toast({ title: "Category removed" });
    setIsDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Admin</p>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">UI state only; no backend calls.</p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="mr-2 h-4 w-4" /> New category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Organize complaints by type.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditor(cat)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setIsDelete(cat)}>
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Optional"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!isDelete} onOpenChange={(open) => !open && setIsDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This is a UI-only confirmation.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
