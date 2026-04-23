import { getRouteApi } from "@tanstack/react-router";
import { ContentSection } from "../components/content-section";
import { InvoicesTable } from "./components/invoices-table";
import { invoices } from "./data/invoices";

const route = getRouteApi("/_authenticated/subscription/invoices");

export function SubscriptionInvoices() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  return (
    <ContentSection title="Invoices" desc="Review your billing history and download past invoices.">
      <InvoicesTable data={invoices} search={search} navigate={navigate} />
    </ContentSection>
  );
}
