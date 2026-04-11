export interface LaborProviderDirectoryRow {
  providerName: string;
  city: string;
  state: string;
  skillFocus: string;
  leadTime: string;
  coverageType?: string;
  active?: string;
  notes?: string;
}

export const sampleLaborProviderDirectoryRows: LaborProviderDirectoryRow[] = [
  {
    providerName: "Field Nation",
    city: "ALL",
    state: "ALL",
    skillFocus: "General AV Field Services",
    leadTime: "1-3 business days",
    coverageType: "Nationwide",
    active: "Yes",
    notes: "Nationwide labor partner"
  },
  {
    providerName: "TEK Systems",
    city: "ALL",
    state: "ALL",
    skillFocus: "AV/IT Staffing + Field Support",
    leadTime: "2-4 business days",
    coverageType: "Nationwide",
    active: "Yes",
    notes: "Nationwide labor partner"
  },
  {
    providerName: "MediaCentric",
    city: "ALL",
    state: "CA",
    skillFocus: "AV Integration + Service",
    leadTime: "1-2 business days",
    coverageType: "California Markets",
    active: "Yes",
    notes: "California markets only"
  }
];
