import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthedLayout,
});

function AuthedLayout() {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full bg-background">
        <AppTopbar />
        <div className="flex flex-1 w-full overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="flex-1">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}