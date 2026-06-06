import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  blacklisted: "bg-destructive/15 text-destructive border-destructive/30",
  pending: "bg-warning/20 text-warning-foreground border-warning/40",
  blocked: "bg-destructive/15 text-destructive border-destructive/30",
  draft: "bg-muted text-muted-foreground border-border",
  open: "bg-accent/15 text-accent border-accent/30",
  closed: "bg-muted text-muted-foreground border-border",
  awarded: "bg-success/15 text-success border-success/30",
  submitted: "bg-accent/15 text-accent border-accent/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  issued: "bg-accent/15 text-accent border-accent/30",
  in_progress: "bg-warning/20 text-warning-foreground border-warning/40",
  completed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  pending_payment: "bg-warning/20 text-warning-foreground border-warning/40",
  paid: "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("capitalize font-medium", cls)}>
      {status.replace("_", " ")}
    </Badge>
  );
}