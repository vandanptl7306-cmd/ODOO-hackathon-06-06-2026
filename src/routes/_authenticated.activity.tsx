import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useData } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/activity")({
  component: ActivityPage,
});

function ActivityPage() {
  const activity = useData((s) => s.activity);
  return (
    <>
      <PageHeader title="Activity log" description="Full audit trail of procurement events." />
      <PageBody>
        <Card>
          <CardContent className="p-0">
            <ol className="divide-y">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-4 p-4">
                  <div className="mt-1 h-2 w-2 rounded-full bg-accent shrink-0" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-medium">{a.action}</span>
                      <span className="text-xs text-muted-foreground">by {a.actor}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{a.detail}</div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(a.at).toLocaleString()}
                  </div>
                </li>
              ))}
              {activity.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">No activity yet.</li>}
            </ol>
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}