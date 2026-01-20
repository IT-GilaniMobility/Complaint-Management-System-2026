"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = pathname?.startsWith("/login");

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-foreground">
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 md:hidden">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className={cn("flex-1", collapsed ? "md:ml-[76px]" : "md:ml-0")}> 
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="px-4 pb-8 pt-4 md:px-6">{children}</main>
      </div>
    </div>
  );
}
