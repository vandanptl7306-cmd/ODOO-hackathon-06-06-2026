import { createFileRoute, Navigate } from "@tanstack/react-router";
import { z } from "zod";

const search = z.object({ vendorId: z.string().optional() });

export const Route = createFileRoute("/_authenticated/quotations/$rfqId/submit")({
  validateSearch: search.parse,
  component: RedirectToQuotations,
});

function RedirectToQuotations() {
  const { rfqId } = Route.useParams();
  const { vendorId } = Route.useSearch();
  return <Navigate to="/quotations" search={{ rfqId, vendorId }} />;
}