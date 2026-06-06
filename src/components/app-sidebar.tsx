import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/store";
import type { Role } from "@/lib/types";

type NavItem = {
  title: string;
  url: string;
  search?: Record<string, any>;
  roles: Role[];
};

const items: NavItem[] = [
  { title: "Dashboard", url: "/", roles: ["officer", "vendor", "approver", "admin"] },
  { title: "Vendors", url: "/vendors", roles: ["officer", "admin"] },
  { title: "RFQ's", url: "/rfqs", roles: ["officer", "admin"] },
  { title: "Quotations", url: "/quotations", roles: ["officer", "vendor", "admin"] },
  { title: "Approvals", url: "/approvals", roles: ["officer", "approver", "admin"] },
  { title: "Purchase orders", url: "/purchase-orders", roles: ["officer", "vendor", "approver", "admin"] },
  { title: "Invoices", url: "/purchase-orders", search: { type: "invoices" }, roles: ["officer", "vendor", "approver", "admin"] },
  { title: "Reports", url: "/reports", roles: ["officer", "approver", "admin"] },
  { title: "Activity", url: "/activity", roles: ["officer", "approver", "admin"] },
];

export function AppSidebar() {
  const role = useAuth((s) => s.role);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const visible = items.filter((i) => i.roles.includes(role));

  const isActive = (url: string, search?: Record<string, any>) => {
    const isInvoiceSearch = typeof window !== "undefined" && window.location.search.includes("type=invoices");
    if (url === "/purchase-orders") {
      if (search?.type === "invoices") {
        return pathname === "/purchase-orders" && isInvoiceSearch;
      } else {
        return pathname === "/purchase-orders" && !isInvoiceSearch;
      }
    }
    return url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border mt-0 pt-0">
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visible.map((item) => (
                <SidebarMenuItem key={item.title + item.url + (item.search?.type || "")}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url, item.search)} 
                    tooltip={item.title}
                    className="h-10 text-sm font-medium px-4 select-none transition-colors duration-200"
                  >
                    <Link to={item.url as any} search={item.search} className="flex items-center gap-2">
                      <span className="opacity-80 font-bold">-</span>
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