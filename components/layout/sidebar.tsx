"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: "admin" | "main";
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "main" },
  { label: "Complaints", href: "/complaints", icon: MessageSquare, group: "main" },
  { label: "Create Complaint", href: "/complaints/new", icon: FilePlus2, group: "main" },
  { label: "Users", href: "/admin/users", icon: Users, group: "admin" },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  const groupedNav = useMemo(
    () => ({
      main: navItems.filter((item) => item.group === "main"),
      admin: navItems.filter((item) => item.group === "admin"),
    }),
    []
  );

  const Item = ({ item }: { item: NavItem }) => {
    const active = pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-5 w-5" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-card/70 px-3 py-4 shadow-sm",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 px-1">
        <img
          src="/GE.png"
          alt="Logo"
          className="h-9 w-9"
        />
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold leading-tight">Complaint Management</p>
            <p className="text-xs text-muted-foreground">Admin Console</p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-1">
        {groupedNav.main.map((item) => (
          <Item key={item.href} item={item} />
        ))}
      </div>

      <Separator className="my-4" />
      {!collapsed && <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>}
      <div className="mt-2 space-y-1">
        {groupedNav.admin.map((item) => (
          <Item key={item.href} item={item} />
        ))}
      </div>

      <div className="mt-auto pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={onToggle}
        >
          {collapsed ? "Expand" : "Collapse"}
        </Button>
      </div>
    </aside>
  );
}
