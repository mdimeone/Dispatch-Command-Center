import { Project, Technician } from "@/types/domain";

export const technicians: Technician[] = [
  {
    id: "tech-1",
    name: "Brian Fritz",
    role: "Field Technician",
    homeBase: "Malvern, PA",
    skillTags: ["Displays", "General Troubleshooting", "Client Coordination"]
  },
  {
    id: "tech-2",
    name: "Patrick Shea",
    role: "Lead AV Technician",
    homeBase: "Atlanta, GA",
    skillTags: ["DSP", "Control", "General Troubleshooting"]
  },
  {
    id: "tech-3",
    name: "Danielle Moss",
    role: "Field Engineer",
    homeBase: "New York, NY",
    skillTags: ["Programming", "Remote Support", "Networking"]
  },
  {
    id: "tech-4",
    name: "Theo Bennett",
    role: "Service Technician",
    homeBase: "Raleigh, NC",
    skillTags: ["Networking", "Displays", "Vendor Coordination"]
  }
];

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Malvern Room Recovery",
    clientName: "THE VANGUARD GROUP, INC.",
    phase: "Break/Fix",
    soldScopeSummary: "Room recovery and device replacement support for workplace AV incidents."
  },
  {
    id: "proj-2",
    name: "Christie's Broadcast Support",
    clientName: "Christie's Inc",
    phase: "Managed Services",
    soldScopeSummary: "Broadcast and boardroom support with remote escalation coverage."
  },
  {
    id: "proj-3",
    name: "Raleigh Executive Rooms",
    clientName: "AmeriHealth Caritas",
    phase: "Service Delivery",
    soldScopeSummary: "Conference room issue remediation and validation support."
  }
];
