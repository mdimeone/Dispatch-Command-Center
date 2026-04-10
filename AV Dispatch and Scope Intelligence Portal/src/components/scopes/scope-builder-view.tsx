import { getDispatches, getServiceCases } from "@/lib/data/repository";
import { ScopeBuilderWorkbench } from "@/components/scopes/scope-builder-workbench";

interface ScopeCaseSeed {
  caseNumber: string;
  clientName: string;
  siteName: string;
  city: string;
  state: string;
  address: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

function buildSeedCases(): ScopeCaseSeed[] {
  const byCase = new Map<string, ScopeCaseSeed>();

  const serviceCases = getServiceCases();
  for (const item of serviceCases) {
    const state = item.site.address?.stateOrProvince ?? item.site.state ?? "";
    const city = item.site.address?.city ?? item.site.city ?? "";
    const address = item.site.address
      ? `${item.site.address.street}, ${item.site.address.city}, ${item.site.address.stateOrProvince} ${item.site.address.postalCode}`.trim()
      : "";
    byCase.set(item.caseNumber, {
      caseNumber: item.caseNumber,
      clientName: item.client.name,
      siteName: item.site.name,
      city,
      state,
      address,
      contactName: item.primaryContact?.name ?? "",
      contactEmail: item.primaryContact?.email ?? "",
      contactPhone: item.primaryContact?.mobilePhone ?? item.primaryContact?.businessPhone ?? ""
    });
  }

  const dispatches = getDispatches();
  for (const item of dispatches) {
    if (byCase.has(item.caseNumber)) continue;
    byCase.set(item.caseNumber, {
      caseNumber: item.caseNumber,
      clientName: item.client.name,
      siteName: item.site.name,
      city: item.site.address?.city ?? item.site.city ?? "",
      state: item.site.address?.stateOrProvince ?? item.site.state ?? "",
      address: item.site.address
        ? `${item.site.address.street}, ${item.site.address.city}, ${item.site.address.stateOrProvince} ${item.site.address.postalCode}`.trim()
        : "",
      contactName: "",
      contactEmail: "",
      contactPhone: ""
    });
  }

  return Array.from(byCase.values()).sort((a, b) => a.caseNumber.localeCompare(b.caseNumber));
}

export function ScopeBuilderView() {
  return <ScopeBuilderWorkbench seedCases={buildSeedCases()} />;
}
