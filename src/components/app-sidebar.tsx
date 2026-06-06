import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Send,
  GitCompare,
  ShieldCheck,
  Receipt,
  Activity,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/store";
import type { Role } from "@/lib/types";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const items: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["officer", "vendor", "approver", "admin"] },
  { title: "Vendors", url: "/vendors", icon: Building2, roles: ["officer", "admin"] },
  { title: "RFQs", url: "/rfqs", icon: FileText, roles: ["officer", "admin"] },
  { title: "My Quotations", url: "/quotations", icon: Send, roles: ["vendor"] },
  { title: "Comparison", url: "/rfqs", icon: GitCompare, roles: ["officer"] },
  { title: "Approvals", url: "/approvals", icon: ShieldCheck, roles: ["approver", "admin"] },
  { title: "Purchase Orders", url: "/purchase-orders", icon: Receipt, roles: ["officer", "vendor", "approver", "admin"] },
  { title: "Activity Log", url: "/activity", icon: Activity, roles: ["officer", "approver", "admin"] },
  { title: "Reports", url: "/reports", icon: BarChart3, roles: ["officer", "approver", "admin"] },
  { title: "Users", url: "/admin/users", icon: Users, roles: ["admin"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["officer", "vendor", "approver", "admin"] },
];

export function AppSidebar() {
  const role = useAuth((s) => s.role);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const visible = items.filter((i) => i.roles.includes(role));

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            V
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">VendorBridge</span>
            <span className="text-xs text-sidebar-foreground/60">Procurement ERP</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((item) => (
                <SidebarMenuItem key={item.title + item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}