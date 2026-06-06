import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsersPage,
});

const mockUsers = [
  { name: "Aanya Mehta", email: "aanya@vendorbridge.app", role: "Admin" },
  { name: "Rohit Sharma", email: "rohit@vendorbridge.app", role: "Procurement Officer" },
  { name: "Priya Kapoor", email: "priya@vendorbridge.app", role: "Manager / Approver" },
  { name: "Neel Patel", email: "neel@acme.test", role: "Vendor" },
  { name: "Saira Khan", email: "saira@globex.test", role: "Vendor" },
];

function AdminUsersPage() {
  return (
    <>
      <PageHeader title="Users & roles" description="Manage workspace members and their access levels." />
      <PageBody>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((u) => (
                <TableRow key={u.email}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}