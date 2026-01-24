"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Ellipsis, ExternalLink, Filter, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, complaintStatusLabel, formatDate, priorityColors, statusColors } from "@/lib/utils";
import type { Category, Complaint, User } from "@/lib/mock-data";

export type ComplaintTableProps = {
  data: Complaint[];
  categories: Category[];
  users: User[];
  loading?: boolean;
  onAssign?: (complaint: Complaint) => void;
  onChangeStatus?: (complaint: Complaint) => void;
};

export function ComplaintTable({ data, categories, users, loading, onAssign, onChangeStatus }: ComplaintTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({} as Record<string, boolean>);
  const [rowSelection, setRowSelection] = useState({});

  const categoryLookup = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);
  const userLookup = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u.name])), [users]);

  const columns = useMemo<ColumnDef<Complaint>[]>(
    () => [
      {
        accessorKey: "number",
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Complaint No
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.number}</span>,
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground">{row.original.subject}</span>
            <span className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</span>
          </div>
        ),
      },
      {
        accessorKey: "categoryId",
        header: "Category",
        cell: ({ row }) => {
          const categoryName =
            categoryLookup[row.original.categoryId] ?? row.original.categoryId ?? "Unknown";
          return <span className="text-sm text-muted-foreground">{categoryName}</span>;
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Badge className={cn("w-fit border", priorityColors[row.original.priority])}>{row.original.priority}</Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const label = complaintStatusLabel(row.original);
          return <Badge className={cn("w-fit border", statusColors[label])}>{label}</Badge>;
        },
      },
      {
        accessorKey: "reporter",
        header: "Reporter",
        cell: ({ row }) => <span className="text-sm">{row.original.reporter}</span>,
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.assignedTo ? row.original.assignedTo : "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button className="flex items-center gap-1" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Created At
            <ArrowUpDown className="h-4 w-4" />
          </button>
        ),
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
      },
      {
        accessorKey: "slaDueAt",
        header: "SLA Due",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{formatDate(row.original.slaDueAt)}</span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/complaints/${row.original.id}`)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/complaints/${row.original.id}`)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign?.(row.original)}>Assign</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatus?.(row.original)}>
                  Change status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [categoryLookup, onAssign, onChangeStatus, router, userLookup]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{table.getFilteredRowModel().rows.length} results</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllLeafColumns()
              .filter((col) => col.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading complaints...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => router.push(`/complaints/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  No complaints found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
