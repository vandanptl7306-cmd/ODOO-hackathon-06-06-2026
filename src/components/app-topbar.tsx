import { useNavigate } from "@tanstack/react-router";
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
    <header className="flex h-14 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">View as</span>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="h-8 w-[210px]">
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
            <Button variant="ghost" size="sm" className="gap-2 px-2 hover:bg-muted rounded-md transition-colors duration-200">
              {user?.avatarUrl ? (
                <Avatar className="h-6 w-6 border border-border/50">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-[10px]">{user.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              ) : (
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="hidden sm:inline font-medium text-sm">{user?.name ?? "User"}</span>
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