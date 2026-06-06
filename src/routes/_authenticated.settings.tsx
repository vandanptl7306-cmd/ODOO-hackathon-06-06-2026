import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useData } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useAuth((s) => s.user);
  const reset = useData((s) => s.reset);
  return (
    <>
      <PageHeader title="Settings" description="Profile and workspace preferences." />
      <PageBody>
        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Name</Label><Input defaultValue={user?.name} /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Organization</Label><Input defaultValue="VendorBridge Demo Co." /></div>
            <div className="md:col-span-2 flex justify-end"><Button onClick={() => toast.success("Profile saved")}>Save profile</Button></div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader><CardTitle>Demo data</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Reset vendors, RFQs, quotations, POs, and activity to the seeded sample data.</p>
            <Button variant="outline" onClick={() => { reset(); toast.success("Demo data reset"); }}>Reset data</Button>
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}