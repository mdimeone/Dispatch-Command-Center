"use client";

import { useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { Download, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

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

interface ScopeBuilderWorkbenchProps {
  seedCases: ScopeCaseSeed[];
}

type StaffingMode = "Internal" | "Labor Partner" | "Hybrid";
type YesNo = "Yes" | "No";
type DownloadFormat = "txt" | "doc";

interface ScopeFormState {
  caseNumber: string;
  clientName: string;
  siteName: string;
  city: string;
  state: string;
  siteAddress: string;
  visitDate: string;
  visitTime: string;
  visitLength: string;
  caseComplexity: string;
  techCount: string;
  workScope: string;
  onsiteContactName: string;
  onsiteContactPhone: string;
  onsiteContactEmail: string;
  caseManagerAssigned: string;
  localFieldSupervisor: string;
  staffingMode: StaffingMode;
  laborPartnerName: string;
  laborPartnerTechType: string;
  preferredTech: string;
  assignedStaff: string;
  chargeBackNumber: string;
  staffSupervisor: string;
  isInternalTechLead: YesNo;
  hasInternalActions: YesNo;
  internalActionDetails: string;
  needsRemoteSupport: YesNo;
  remoteSupportEngineer: string;
  remoteSupportSupervisor: string;
  hasSpecialTools: YesNo;
  specialToolsDetails: string;
  hasTier2Notes: YesNo;
  tier2Notes: string;
  hasPreviousVisit: YesNo;
  previousVisitNotes: string;
}

interface LaborProvider {
  id: string;
  providerName: string;
  city: string;
  state: string;
  skillFocus: string;
  leadTime: string;
}

interface InternalTech {
  id: string;
  name: string;
  homeCity: string;
  homeState: string;
  role: string;
  utilizationPercent: number;
}

const DEFAULT_FORM: ScopeFormState = {
  caseNumber: "",
  clientName: "",
  siteName: "",
  city: "",
  state: "",
  siteAddress: "",
  visitDate: "",
  visitTime: "",
  visitLength: "Full Day",
  caseComplexity: "Standard",
  techCount: "1",
  workScope: "",
  onsiteContactName: "",
  onsiteContactPhone: "",
  onsiteContactEmail: "",
  caseManagerAssigned: "",
  localFieldSupervisor: "",
  staffingMode: "Internal",
  laborPartnerName: "",
  laborPartnerTechType: "Preferred",
  preferredTech: "",
  assignedStaff: "",
  chargeBackNumber: "",
  staffSupervisor: "",
  isInternalTechLead: "Yes",
  hasInternalActions: "No",
  internalActionDetails: "",
  needsRemoteSupport: "No",
  remoteSupportEngineer: "",
  remoteSupportSupervisor: "",
  hasSpecialTools: "No",
  specialToolsDetails: "",
  hasTier2Notes: "No",
  tier2Notes: "",
  hasPreviousVisit: "No",
  previousVisitNotes: ""
};

const LABOR_PROVIDERS: LaborProvider[] = [
  { id: "lp-1", providerName: "Mid-Atlantic AV Services", city: "Malvern", state: "PA", skillFocus: "Conference Room Break/Fix", leadTime: "2 business days" },
  { id: "lp-2", providerName: "Tri-State Field Ops", city: "New York", state: "NY", skillFocus: "Broadcast + Executive Spaces", leadTime: "1 business day" },
  { id: "lp-3", providerName: "Southeast Integration Labor", city: "Atlanta", state: "GA", skillFocus: "DSP / Control / Display", leadTime: "2-3 business days" },
  { id: "lp-4", providerName: "Carolina AV Resource Group", city: "Raleigh", state: "NC", skillFocus: "Troubleshooting + Closeout", leadTime: "3 business days" }
];

const INTERNAL_TECH_POOL: InternalTech[] = [
  { id: "it-1", name: "Brian Fritz", homeCity: "Malvern", homeState: "PA", role: "Field Technician", utilizationPercent: 42 },
  { id: "it-2", name: "Patrick Shea", homeCity: "Atlanta", homeState: "GA", role: "Lead AV Technician", utilizationPercent: 81 },
  { id: "it-3", name: "Danielle Moss", homeCity: "New York", homeState: "NY", role: "Field Engineer", utilizationPercent: 55 },
  { id: "it-4", name: "Theo Bennett", homeCity: "Raleigh", homeState: "NC", role: "Service Technician", utilizationPercent: 47 }
];

function normalizeCaseNumber(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function nonEmpty(value: string): string {
  return value.trim() || "TBD";
}

function formatVisitDate(visitDate: string, visitTime: string): string {
  if (!visitDate) return "Date/Time TBD";
  const formatted = new Date(`${visitDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  });
  return visitTime ? `${formatted} ${visitTime}` : formatted;
}

function buildVisitSummary(form: ScopeFormState): string {
  const visitLength = nonEmpty(form.visitLength);
  if (form.staffingMode === "Hybrid") {
    const leadLabel = form.isInternalTechLead === "Yes" ? "Internal Lead" : "Internal Tech";
    const partnerTech = form.preferredTech.trim() ? ` | ${form.laborPartnerTechType} Tech: ${form.preferredTech.trim()}` : "";
    return `${visitLength} | ${leadLabel}: ${nonEmpty(form.assignedStaff)} | Labor Partner: ${nonEmpty(form.laborPartnerName)}${partnerTech}`;
  }
  if (form.staffingMode === "Labor Partner") {
    const partnerTech = form.preferredTech.trim() ? ` | ${form.laborPartnerTechType} Tech: ${form.preferredTech.trim()}` : "";
    return `${visitLength} | Labor Partner: ${nonEmpty(form.laborPartnerName)}${partnerTech}`;
  }
  return `${visitLength} | Internal Resource | ${nonEmpty(form.assignedStaff)}`;
}

function buildInternalActionsSummary(form: ScopeFormState): string {
  if (form.hasInternalActions !== "Yes") return "";
  return form.internalActionDetails.trim()
    ? `Internal Actions: ${form.internalActionDetails.trim()}`
    : "Internal Actions: Confirm owners and due dates before dispatch.";
}

function buildScopePreview(form: ScopeFormState): string {
  const headingParts = [form.caseNumber && `Case ${form.caseNumber}`, form.clientName, form.siteName].filter(Boolean);
  const heading = headingParts.join(" | ") || "Scope of Work";

  const lines: string[] = [];
  lines.push(heading);
  lines.push("=".repeat(heading.length));
  lines.push("");
  lines.push("Overview");
  lines.push(`- Client: ${nonEmpty(form.clientName)}`);
  lines.push(`- Site: ${nonEmpty(form.siteName)}`);
  lines.push(`- Location: ${nonEmpty(form.city)}, ${nonEmpty(form.state)}`);
  lines.push(`- Address: ${nonEmpty(form.siteAddress)}`);
  lines.push(`- Scheduled visit: ${formatVisitDate(form.visitDate, form.visitTime)}`);
  lines.push(`- Case complexity: ${nonEmpty(form.caseComplexity)}`);
  lines.push(`- Technicians requested: ${nonEmpty(form.techCount)}`);
  lines.push("");
  lines.push("Staffing Plan");
  lines.push(`- Staffing model: ${nonEmpty(form.staffingMode)}`);
  lines.push(`- Case manager assigned: ${nonEmpty(form.caseManagerAssigned)}`);
  lines.push(`- Local field supervisor: ${nonEmpty(form.localFieldSupervisor)}`);
  if (form.staffingMode === "Internal") {
    lines.push(`- Assigned technician(s): ${nonEmpty(form.assignedStaff)}`);
    lines.push(`- Charge Back Number(s): ${nonEmpty(form.chargeBackNumber)}`);
    lines.push(`- Technician supervisor: ${nonEmpty(form.staffSupervisor)}`);
  }
  if (form.staffingMode === "Hybrid") {
    lines.push(`- Internal technician: ${nonEmpty(form.assignedStaff)}`);
    lines.push(`- Is internal tech lead: ${form.isInternalTechLead}`);
    lines.push(`- Charge Back Number(s): ${nonEmpty(form.chargeBackNumber)}`);
    lines.push(`- Technician supervisor: ${nonEmpty(form.staffSupervisor)}`);
    lines.push(`- Labor partner: ${nonEmpty(form.laborPartnerName)}`);
  }
  if (form.staffingMode === "Labor Partner") {
    lines.push(`- Labor partner: ${nonEmpty(form.laborPartnerName)}`);
    lines.push(`- ${form.laborPartnerTechType} technician: ${nonEmpty(form.preferredTech)}`);
  }

  lines.push("");
  lines.push("Onsite Contact");
  lines.push(`- Name: ${nonEmpty(form.onsiteContactName)}`);
  lines.push(`- Phone: ${nonEmpty(form.onsiteContactPhone)}`);
  lines.push(`- Email: ${nonEmpty(form.onsiteContactEmail)}`);
  lines.push("");
  if (form.hasSpecialTools === "Yes") {
    lines.push("Special Tools Required");
    lines.push(form.specialToolsDetails.trim() || "Confirm required special tools before dispatch.");
    lines.push("");
  }
  lines.push("Work Scope");
  lines.push(form.workScope.trim() || "Define onsite tasks, deliverables, and expected completion criteria.");
  lines.push("");
  if (form.needsRemoteSupport === "Yes") {
    lines.push("Remote Support");
    lines.push(`- Remote engineer: ${nonEmpty(form.remoteSupportEngineer)}`);
    lines.push(`- Remote supervisor: ${nonEmpty(form.remoteSupportSupervisor)}`);
    lines.push("");
  }
  if (form.hasTier2Notes === "Yes") {
    lines.push("Tier 2 Notes");
    lines.push(form.tier2Notes.trim() || "Tier 2 guidance to be attached before execution.");
    lines.push("");
  }
  if (form.hasPreviousVisit === "Yes") {
    lines.push("Previous Visit Context");
    lines.push(form.previousVisitNotes.trim() || "Review previous visit history prior to dispatch.");
    lines.push("");
  }
  lines.push("Closeout Expectations");
  lines.push("- Confirm work completed against the agreed scope before leaving site.");
  lines.push("- If any issues prevent completion, contact Area Field Supervisor before leaving site.");
  lines.push("- Capture blockers, follow-up actions, and material exceptions.");
  lines.push("- Provide final notes for customer communication and internal case updates.");

  return lines.join("\n");
}

function textInputClassName() {
  return "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-sky-200 transition focus:border-slate-300 focus:ring";
}

function textareaClassName() {
  return "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-200 transition focus:border-slate-300 focus:ring";
}

function selectClassName() {
  return textInputClassName();
}

function fieldLabelClassName() {
  return "mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function ScopeBuilderWorkbench({ seedCases }: ScopeBuilderWorkbenchProps) {
  const [form, setForm] = useState<ScopeFormState>(DEFAULT_FORM);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("txt");
  const searchParams = useSearchParams();
  const queryPrefillApplied = useRef(false);

  const casesByNormalizedNumber = useMemo(() => {
    const lookup = new Map<string, ScopeCaseSeed>();
    for (const item of seedCases) {
      lookup.set(normalizeCaseNumber(item.caseNumber), item);
    }
    return lookup;
  }, [seedCases]);

  useEffect(() => {
    const normalized = normalizeCaseNumber(form.caseNumber);
    if (!normalized) return;
    const match = casesByNormalizedNumber.get(normalized);
    if (!match) return;
    setForm((prev) => ({
      ...prev,
      clientName: prev.clientName || match.clientName,
      siteName: prev.siteName || match.siteName,
      city: prev.city || match.city,
      state: prev.state || match.state,
      siteAddress: prev.siteAddress || match.address,
      onsiteContactName: prev.onsiteContactName || match.contactName,
      onsiteContactEmail: prev.onsiteContactEmail || match.contactEmail,
      onsiteContactPhone: prev.onsiteContactPhone || match.contactPhone
    }));
  }, [casesByNormalizedNumber, form.caseNumber]);

  const locationMatchedLaborProviders = useMemo(() => {
    const targetState = form.state.trim().toUpperCase();
    const targetCity = form.city.trim().toUpperCase();
    return LABOR_PROVIDERS.filter((provider) => {
      const stateMatch = targetState && provider.state.toUpperCase() === targetState;
      const cityMatch = targetCity && provider.city.toUpperCase() === targetCity;
      return cityMatch || stateMatch;
    });
  }, [form.city, form.state]);

  const lowUtilizationTechs = useMemo(() => {
    const targetState = form.state.trim().toUpperCase();
    return INTERNAL_TECH_POOL
      .filter((tech) => tech.utilizationPercent < 60)
      .sort((a, b) => a.utilizationPercent - b.utilizationPercent)
      .filter((tech) => !targetState || tech.homeState.toUpperCase() === targetState);
  }, [form.state]);

  const visitSummary = useMemo(() => buildVisitSummary(form), [form]);
  const internalActionsSummary = useMemo(() => buildInternalActionsSummary(form), [form]);
  const previewText = useMemo(() => buildScopePreview(form), [form]);

  useEffect(() => {
    if (queryPrefillApplied.current) {
      return;
    }

    const caseNumber = searchParams.get("case")?.trim() ?? "";
    const clientName = searchParams.get("client")?.trim() ?? "";
    const siteName = searchParams.get("site")?.trim() ?? "";
    const city = searchParams.get("city")?.trim() ?? "";
    const state = searchParams.get("state")?.trim() ?? "";
    const siteAddress = searchParams.get("address")?.trim() ?? "";
    const contactName = searchParams.get("contactName")?.trim() ?? "";
    const contactEmail = searchParams.get("contactEmail")?.trim() ?? "";
    const contactPhone = searchParams.get("contactPhone")?.trim() ?? "";

    const hasPrefill =
      caseNumber ||
      clientName ||
      siteName ||
      city ||
      state ||
      siteAddress ||
      contactName ||
      contactEmail ||
      contactPhone;

    if (!hasPrefill) {
      queryPrefillApplied.current = true;
      return;
    }

    setForm((prev) => ({
      ...prev,
      caseNumber: caseNumber || prev.caseNumber,
      clientName: clientName || prev.clientName,
      siteName: siteName || prev.siteName,
      city: city || prev.city,
      state: state || prev.state,
      siteAddress: siteAddress || prev.siteAddress,
      onsiteContactName: contactName || prev.onsiteContactName,
      onsiteContactEmail: contactEmail || prev.onsiteContactEmail,
      onsiteContactPhone: contactPhone || prev.onsiteContactPhone
    }));

    queryPrefillApplied.current = true;
  }, [searchParams]);

  function updateForm<K extends keyof ScopeFormState>(key: K, value: ScopeFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function downloadPreviewText() {
    const safeCase = form.caseNumber.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "_") || "scope_of_work";
    const filename = `${safeCase}_scope_of_work.${downloadFormat}`;
    const blob =
      downloadFormat === "doc"
        ? new Blob(
            [
              `<!doctype html><html><head><meta charset="utf-8"></head><body><pre style="font-family:Calibri,Arial,sans-serif;font-size:11pt;white-space:pre-wrap;">${escapeHtml(previewText)}</pre></body></html>`
            ],
            { type: "application/msword;charset=utf-8" }
          )
        : new Blob([previewText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <SectionHeading
        eyebrow="Scope Builder"
        title="Scope of Work Generator"
        description="Legacy-accurate structured drafting with conditional prompts, location-aware labor options, and a live generated scope preview."
      />

      <div className="grid items-start gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
        <Card className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={fieldLabelClassName()}>Case Number</label>
              <input className={textInputClassName()} value={form.caseNumber} onChange={(event) => updateForm("caseNumber", event.target.value)} placeholder="Case number" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>Case Complexity</label>
              <select className={selectClassName()} value={form.caseComplexity} onChange={(event) => updateForm("caseComplexity", event.target.value)}>
                <option>Standard</option>
                <option>Moderate</option>
                <option>Complex</option>
                <option>Critical</option>
              </select>
            </div>
            <div>
              <label className={fieldLabelClassName()}>Client Name</label>
              <input className={textInputClassName()} value={form.clientName} onChange={(event) => updateForm("clientName", event.target.value)} placeholder="Client name" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>Site Name</label>
              <input className={textInputClassName()} value={form.siteName} onChange={(event) => updateForm("siteName", event.target.value)} placeholder="Site name" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>City</label>
              <input className={textInputClassName()} value={form.city} onChange={(event) => updateForm("city", event.target.value)} placeholder="Site city" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>State</label>
              <input className={textInputClassName()} value={form.state} onChange={(event) => updateForm("state", event.target.value)} placeholder="State (e.g., PA)" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>Visit Date</label>
              <input className={textInputClassName()} type="date" value={form.visitDate} onChange={(event) => updateForm("visitDate", event.target.value)} />
            </div>
            <div>
              <label className={fieldLabelClassName()}>Visit Time</label>
              <input className={textInputClassName()} value={form.visitTime} onChange={(event) => updateForm("visitTime", event.target.value)} placeholder="8:00 AM" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>Technicians Requested</label>
              <select className={selectClassName()} value={form.techCount} onChange={(event) => updateForm("techCount", event.target.value)}>
                {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={fieldLabelClassName()}>Visit Length</label>
              <select className={selectClassName()} value={form.visitLength} onChange={(event) => updateForm("visitLength", event.target.value)}>
                <option>Half Day</option>
                <option>Full Day</option>
              </select>
            </div>
          </div>
          <div>
            <label className={fieldLabelClassName()}>Site Address</label>
            <textarea
              className={cn(textareaClassName(), "min-h-[72px]")}
              value={form.siteAddress}
              onChange={(event) => updateForm("siteAddress", event.target.value)}
              placeholder="Site address"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={fieldLabelClassName()}>Work Scope</label>
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs text-white">
                <Sparkles className="h-3.5 w-3.5" />
                AI assist (next)
              </button>
            </div>
            <textarea
              className={cn(textareaClassName(), "min-h-[150px]")}
              value={form.workScope}
              onChange={(event) => updateForm("workScope", event.target.value)}
              placeholder="Describe onsite tasks, deliverables, and completion criteria."
            />
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Scope Guidance + Staffing</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={fieldLabelClassName()}>Staffing Model</label>
              <select className={selectClassName()} value={form.staffingMode} onChange={(event) => updateForm("staffingMode", event.target.value as StaffingMode)}>
                <option value="Internal">Internal</option>
                <option value="Labor Partner">Labor Partner</option>
                <option value="Hybrid">Hybrid: Internal Lead + Labor Partner</option>
              </select>
            </div>
            <div>
              <label className={fieldLabelClassName()}>Case Manager Assigned</label>
              <input className={textInputClassName()} value={form.caseManagerAssigned} onChange={(event) => updateForm("caseManagerAssigned", event.target.value)} placeholder="Case manager" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>Local Field Supervisor</label>
              <input className={textInputClassName()} value={form.localFieldSupervisor} onChange={(event) => updateForm("localFieldSupervisor", event.target.value)} placeholder="Local field supervisor" />
            </div>
            <div>
              <label className={fieldLabelClassName()}>Assigned Technician / Lead</label>
              <input className={textInputClassName()} value={form.assignedStaff} onChange={(event) => updateForm("assignedStaff", event.target.value)} placeholder="Assigned technician(s)" />
            </div>
          </div>

          {(form.staffingMode === "Labor Partner" || form.staffingMode === "Hybrid") && (
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className={fieldLabelClassName()}>Labor Partner Name</label>
                <input className={textInputClassName()} value={form.laborPartnerName} onChange={(event) => updateForm("laborPartnerName", event.target.value)} placeholder="Labor provider" />
              </div>
              <div>
                <label className={fieldLabelClassName()}>Labor Partner Tech Type</label>
                <select className={selectClassName()} value={form.laborPartnerTechType} onChange={(event) => updateForm("laborPartnerTechType", event.target.value)}>
                  <option>Preferred</option>
                  <option>Required</option>
                </select>
              </div>
              <div>
                <label className={fieldLabelClassName()}>Preferred / Required Tech</label>
                <input className={textInputClassName()} value={form.preferredTech} onChange={(event) => updateForm("preferredTech", event.target.value)} placeholder="Name (optional)" />
              </div>
            </div>
          )}

          {(form.staffingMode === "Internal" || form.staffingMode === "Hybrid") && (
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className={fieldLabelClassName()}>Technician Supervisor</label>
                <input className={textInputClassName()} value={form.staffSupervisor} onChange={(event) => updateForm("staffSupervisor", event.target.value)} placeholder="Technician supervisor" />
              </div>
              <div>
                <label className={fieldLabelClassName()}>Charge Back Number(s)</label>
                <input className={textInputClassName()} value={form.chargeBackNumber} onChange={(event) => updateForm("chargeBackNumber", event.target.value)} placeholder="Charge back" />
              </div>
              {form.staffingMode === "Hybrid" && (
                <div>
                  <label className={fieldLabelClassName()}>Is Internal Tech Lead?</label>
                  <select className={selectClassName()} value={form.isInternalTechLead} onChange={(event) => updateForm("isInternalTechLead", event.target.value as YesNo)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className={fieldLabelClassName()}>Internal Actions?</label>
              <select className={selectClassName()} value={form.hasInternalActions} onChange={(event) => updateForm("hasInternalActions", event.target.value as YesNo)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className={fieldLabelClassName()}>Remote Support Needed?</label>
              <select className={selectClassName()} value={form.needsRemoteSupport} onChange={(event) => updateForm("needsRemoteSupport", event.target.value as YesNo)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className={fieldLabelClassName()}>Special Tools Required?</label>
              <select className={selectClassName()} value={form.hasSpecialTools} onChange={(event) => updateForm("hasSpecialTools", event.target.value as YesNo)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className={fieldLabelClassName()}>Tier 2 Notes?</label>
              <select className={selectClassName()} value={form.hasTier2Notes} onChange={(event) => updateForm("hasTier2Notes", event.target.value as YesNo)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className={fieldLabelClassName()}>Previous Visit?</label>
              <select className={selectClassName()} value={form.hasPreviousVisit} onChange={(event) => updateForm("hasPreviousVisit", event.target.value as YesNo)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {form.hasInternalActions === "Yes" && (
            <div>
              <label className={fieldLabelClassName()}>Internal Action Details</label>
              <textarea className={cn(textareaClassName(), "min-h-[80px]")} value={form.internalActionDetails} onChange={(event) => updateForm("internalActionDetails", event.target.value)} />
            </div>
          )}
          {form.needsRemoteSupport === "Yes" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={fieldLabelClassName()}>Remote Support Engineer</label>
                <input className={textInputClassName()} value={form.remoteSupportEngineer} onChange={(event) => updateForm("remoteSupportEngineer", event.target.value)} />
              </div>
              <div>
                <label className={fieldLabelClassName()}>Remote Support Supervisor</label>
                <input className={textInputClassName()} value={form.remoteSupportSupervisor} onChange={(event) => updateForm("remoteSupportSupervisor", event.target.value)} />
              </div>
            </div>
          )}
          {form.hasSpecialTools === "Yes" && (
            <div>
              <label className={fieldLabelClassName()}>Special Tools Details</label>
              <textarea className={cn(textareaClassName(), "min-h-[72px]")} value={form.specialToolsDetails} onChange={(event) => updateForm("specialToolsDetails", event.target.value)} />
            </div>
          )}
          {form.hasTier2Notes === "Yes" && (
            <div>
              <label className={fieldLabelClassName()}>Tier 2 Notes</label>
              <textarea className={cn(textareaClassName(), "min-h-[72px]")} value={form.tier2Notes} onChange={(event) => updateForm("tier2Notes", event.target.value)} />
            </div>
          )}
          {form.hasPreviousVisit === "Yes" && (
            <div>
              <label className={fieldLabelClassName()}>Previous Visit Notes</label>
              <textarea className={cn(textareaClassName(), "min-h-[72px]")} value={form.previousVisitNotes} onChange={(event) => updateForm("previousVisitNotes", event.target.value)} />
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Location-Based Labor + Utilization</h3>
          <p className="text-sm text-slate-600">
            Current source (manual seed before build): <code>./data/current/labor_provider_directory.xlsx</code>
          </p>
          <p className="text-sm text-slate-600">
            Future source: SharePoint labor provider list + internal scheduling database.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Matching Labor Providers</p>
              {locationMatchedLaborProviders.length ? (
                locationMatchedLaborProviders.map((provider) => (
                  <div key={provider.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-medium text-slate-900">{provider.providerName}</p>
                    <p className="text-sm text-slate-600">
                      {provider.city}, {provider.state}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Focus: {provider.skillFocus}</p>
                    <p className="text-xs text-slate-500">Lead time: {provider.leadTime}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No location-matched labor providers yet. Add rows in the Excel file above.</p>
              )}
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Low Utilization Internal Techs
              </p>
              <p className="text-xs text-slate-500">
                Interim source: <code>./data/current/internal_technician_schedule.xlsx</code>
              </p>
              {lowUtilizationTechs.length ? (
                lowUtilizationTechs.map((tech) => (
                  <div key={tech.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-medium text-slate-900">{tech.name}</p>
                    <p className="text-sm text-slate-600">{tech.role} - {tech.homeCity}, {tech.homeState}</p>
                    <p className="mt-1 text-xs text-emerald-700">
                      Utilization: {tech.utilizationPercent}% (candidate for dispatch)
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No low-utilization internal technicians matched this location.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

        <div className="space-y-3 self-start xl:sticky xl:top-3">
          <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-slate-900">Generated Scope Preview</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="sky">{form.caseNumber || "No case selected"}</Badge>
                <Badge tone="slate">{form.staffingMode}</Badge>
                <Badge tone="amber">{form.caseComplexity}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={downloadFormat}
                onChange={(event) => setDownloadFormat(event.target.value as DownloadFormat)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900"
              >
                <option value="txt">Text (.txt)</option>
                <option value="doc">Word (.doc)</option>
              </select>
              <button
                type="button"
                onClick={downloadPreviewText}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-1.5 text-sm text-sky-900">
            {visitSummary}
          </div>
          {internalActionsSummary ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-900">
              {internalActionsSummary}
            </div>
          ) : null}
          <pre className="h-[62vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-800 shadow-inner xl:h-[calc(100vh-15.5rem)]">
            {previewText}
          </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
