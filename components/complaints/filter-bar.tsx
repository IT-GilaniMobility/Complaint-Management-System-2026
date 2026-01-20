"use client";

import { Download, RotateCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category, ComplaintPriority, ComplaintStatus } from "@/lib/mock-data";

export type ComplaintFilters = {
  search: string;
  status: ComplaintStatus | "All" | "Overdue";
  priority: ComplaintPriority | "All";
  categoryId: string | "all";
  assigned: "all" | "assigned" | "unassigned";
  dateFrom?: string;
  dateTo?: string;
};

export function FilterBar({
  filters,
  onChange,
  onClear,
  onExport,
  categories,
}: {
  filters: ComplaintFilters;
  categories: Category[];
  onChange: (filters: ComplaintFilters) => void;
  onClear: () => void;
  onExport: () => void;
}) {
  const handleField = <K extends keyof ComplaintFilters>(key: K, value: ComplaintFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Label className="mb-1 block text-xs uppercase text-muted-foreground">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => handleField("search", e.target.value)}
              placeholder="Search by ID, subject, reporter"
              className="pl-9"
            />
          </div>
        </div>

        <div>
          <Label className="mb-1 block text-xs uppercase text-muted-foreground">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleField("status", value as ComplaintFilters["status"])}>
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Unassigned", "In Progress", "Resolved", "Closed", "Overdue"].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block text-xs uppercase text-muted-foreground">Priority</Label>
          <Select
            value={filters.priority}
            onValueChange={(value) => handleField("priority", value as ComplaintFilters["priority"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Low", "Medium", "High", "Urgent"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block text-xs uppercase text-muted-foreground">Category</Label>
          <Select
            value={filters.categoryId}
            onValueChange={(value) => handleField("categoryId", value as ComplaintFilters["categoryId"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block text-xs uppercase text-muted-foreground">Assigned</Label>
          <Select
            value={filters.assigned}
            onValueChange={(value) => handleField("assigned", value as ComplaintFilters["assigned"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="mb-1 block text-xs uppercase text-muted-foreground">From</Label>
            <Input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) => handleField("dateFrom", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs uppercase text-muted-foreground">To</Label>
            <Input type="date" value={filters.dateTo ?? ""} onChange={(e) => handleField("dateTo", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">Filters update the table instantly.</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            <RotateCw className="mr-2 h-4 w-4" /> Clear filters
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
