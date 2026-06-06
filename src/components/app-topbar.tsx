import { useNavigate, Link } from "@tanstack/react-router";
import { LogOut, User as UserIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, roleLabel } from "@/lib/store";
import type { Role } from "@/lib/types";

export function AppTopbar() {
  const { user, role, setRole, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex h-14 items-center justify-between bg-[oklch(0.93_0.05_160)] border-b border-[oklch(0.88_0.05_160)] px-6 shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-[oklch(0.2_0.06_160)] hover:bg-[oklch(0.88_0.05_160)]/50" />
        <Link to="/" className="text-xl font-bold tracking-tight text-[oklch(0.2_0.06_160)] hover:opacity-90">
          VendorBridge
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[oklch(0.35_0.05_260)] font-medium">View as</span>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="h-8 w-[190px] bg-white border-[oklch(0.9_0.015_250)] text-[oklch(0.25_0.08_260)] focus:ring-[oklch(0.55_0.13_245)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="officer">{roleLabel("officer")}</SelectItem>
              <SelectItem value="vendor">{roleLabel("vendor")}</SelectItem>
              <SelectItem value="approver">{roleLabel("approver")}</SelectItem>
              <SelectItem value="admin">{roleLabel("admin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-[oklch(0.88_0.05_160)]/50 rounded-md transition-colors duration-200">
              {user?.avatarUrl ? (
                <Avatar className="h-7 w-7 border border-[oklch(0.8_0.05_160)]">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-[10px] bg-[oklch(0.25_0.08_260)] text-white">{user.name?.slice(0, 2).toUpperCase() || "VB"}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.25_0.08_260)] text-white font-bold text-xs">
                  {user?.name?.slice(0, 1).toUpperCase() || "U"}
                </div>
              )}
              <span className="hidden sm:inline font-medium text-sm text-[oklch(0.2_0.06_160)]">{user?.name ?? "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>Settings</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}