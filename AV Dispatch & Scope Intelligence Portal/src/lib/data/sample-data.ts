import {
  DashboardMetric,
  DispatchRecord,
  Project,
  QueueItem,
  Technician
} from "@/types/domain";

export const technicians: Technician[] = [
  {
    id: "tech-1",
    name: "Miles Rivera",
    role: "Lead AV Technician",
    homeBase: "New York, NY",
    skillTags: ["Commissioning", "DSP", "Client Training"]
  },
  {
    id: "tech-2",
    name: "Danielle Moss",
    role: "Field Engineer",
    homeBase: "Newark, NJ",
    skillTags: ["Troubleshooting", "Video Walls", "Control"]
  },
  {
    id: "tech-3",
    name: "Theo Bennett",
    role: "Service Technician",
    homeBase: "White Plains, NY",
    skillTags: ["Networking", "Displays", "Rack Work"]
  }
];

export const dispatchRecords: DispatchRecord[] = [
  {
    id: "disp-1001",
    caseNumber: "CAS-24081",
    projectName: "Hudson Exchange Executive Center",
    visitPurpose: "Conference room audio failures and scope validation",
    visitDate: "2026-04-06T08:30:00-04:00",
    status: "Needs Scope",
    urgency: "High",
    laborSource: "Internal",
    region: "Northeast",
    supervisor: "Alyssa Grant",
    assignedTechIds: ["tech-1", "tech-2"],
    blockers: ["Awaiting rack photos", "Client contact unavailable after 3 PM"],
    notes: [
      "Prior visit indicated intermittent DSP reboots.",
      "Customer asked about adding overflow audio."
    ],
    client: {
      id: "client-1",
      name: "Hudson Capital",
      segment: "Financial Services"
    },
    site: {
      id: "site-1",
      name: "Hudson Exchange Executive Center",
      city: "Jersey City",
      state: "NJ",
      timezone: "America/New_York",
      accessNotes: "Loading dock access before 9 AM only."
    },
    weather: {
      summary: "Rain early, clearing by noon",
      temperatureF: 56,
      severeRisk: "Moderate"
    },
    traffic: {
      etaMinutes: 52,
      routeRisk: "High",
      leaveBy: "06:55 AM"
    },
    scope: {
      id: "scope-1001",
      caseNumber: "CAS-24081",
      status: "Draft",
      confidence: 72,
      versions: [
        {
          id: "scope-1001-v1",
          label: "Initial draft",
          updatedAt: "2026-04-03T16:15:00-04:00",
          updatedBy: "System"
        }
      ],
      sections: [
        {
          id: "overview",
          title: "Overview",
          body: "Investigate DSP instability, verify room audio path, and confirm whether requested overflow audio was part of the original sold intent."
        },
        {
          id: "staffing",
          title: "Staffing Plan",
          body: "Lead technician plus field engineer for troubleshooting, programming validation, and client walkthrough."
        },
        {
          id: "risks",
          title: "Risks and Assumptions",
          body: "Rack access photos are not yet available. Expansion request may be outside sold scope."
        }
      ]
    },
    validation: {
      verdict: "Possibly Aligned",
      confidence: 64,
      matchedBomItems: ["DSP-1", "AMP-2", "Ceiling speaker zone A"],
      missingBomItems: ["Overflow audio zone B"],
      reviewerNotes: [
        "Expansion language should be separated from corrective service scope.",
        "Confirm if overflow request needs change-order handling."
      ]
    }
  },
  {
    id: "disp-1002",
    caseNumber: "CAS-24092",
    projectName: "Midtown Legal Briefing Center",
    visitPurpose: "Video wall sync issue and training follow-up",
    visitDate: "2026-04-07T10:00:00-04:00",
    status: "Scope Drafted",
    urgency: "Medium",
    laborSource: "Internal",
    region: "Northeast",
    supervisor: "Alyssa Grant",
    assignedTechIds: ["tech-2"],
    blockers: ["Awaiting approved after-hours badge"],
    notes: [
      "Previous service call resolved one panel sync issue.",
      "Client requested refresher training for support staff."
    ],
    client: {
      id: "client-2",
      name: "Marlowe & Finch",
      segment: "Legal"
    },
    site: {
      id: "site-2",
      name: "Midtown Legal Briefing Center",
      city: "New York",
      state: "NY",
      timezone: "America/New_York",
      accessNotes: "Photo ID and approved badge required."
    },
    weather: {
      summary: "Clear with mild wind",
      temperatureF: 61,
      severeRisk: "Low"
    },
    traffic: {
      etaMinutes: 38,
      routeRisk: "Moderate",
      leaveBy: "08:45 AM"
    },
    scope: {
      id: "scope-1002",
      caseNumber: "CAS-24092",
      status: "In Review",
      confidence: 88,
      versions: [
        {
          id: "scope-1002-v1",
          label: "Technician draft",
          updatedAt: "2026-04-03T11:45:00-04:00",
          updatedBy: "Danielle Moss"
        },
        {
          id: "scope-1002-v2",
          label: "Coordinator revision",
          updatedAt: "2026-04-04T08:05:00-04:00",
          updatedBy: "Jordan Lee"
        }
      ],
      sections: [
        {
          id: "scope",
          title: "Scope of Work",
          body: "Validate video wall signal flow, confirm processor firmware stability, align display group timing, and provide a 30-minute refresher with local support contacts."
        },
        {
          id: "tools",
          title: "Required Tools / Access",
          body: "Laptop with processor utility, spare HDMI cable, secure rack keys, approved after-hours badge."
        }
      ]
    },
    validation: {
      verdict: "Aligned",
      confidence: 91,
      matchedBomItems: ["Video wall processor", "Display group licensing", "Support training allowance"],
      missingBomItems: [],
      reviewerNotes: ["Proceed once badge approval is attached to the case."]
    }
  },
  {
    id: "disp-1003",
    caseNumber: "CAS-24104",
    projectName: "Harbor Point Broadcast Suite",
    visitPurpose: "Network remediation and expanded monitoring request",
    visitDate: "2026-04-08T07:30:00-04:00",
    status: "At Risk",
    urgency: "High",
    laborSource: "Subcontractor",
    region: "Mid-Atlantic",
    supervisor: "Renee Foster",
    assignedTechIds: ["tech-3"],
    blockers: ["Pending subcontractor approval", "No confirmed switch configuration backup"],
    notes: [
      "Field note suggests unmanaged expansion on AV VLAN.",
      "Customer wants proactive monitoring proposal."
    ],
    client: {
      id: "client-3",
      name: "Harbor Point Media",
      segment: "Broadcast"
    },
    site: {
      id: "site-3",
      name: "Harbor Point Broadcast Suite",
      city: "Baltimore",
      state: "MD",
      timezone: "America/New_York",
      accessNotes: "Escort required in control rooms."
    },
    weather: {
      summary: "Cloudy with gusts",
      temperatureF: 58,
      severeRisk: "Moderate"
    },
    traffic: {
      etaMinutes: 74,
      routeRisk: "High",
      leaveBy: "05:35 AM"
    },
    scope: {
      id: "scope-1003",
      caseNumber: "CAS-24104",
      status: "Draft",
      confidence: 51,
      versions: [
        {
          id: "scope-1003-v1",
          label: "AI draft",
          updatedAt: "2026-04-04T07:15:00-04:00",
          updatedBy: "System"
        }
      ],
      sections: [
        {
          id: "reason",
          title: "Reason for Visit",
          body: "Stabilize AV network behavior affecting control and streaming confidence before major client briefings."
        },
        {
          id: "out-of-scope",
          title: "Out-of-Scope Warnings",
          body: "Proactive monitoring expansion appears to exceed current sold support package."
        }
      ]
    },
    validation: {
      verdict: "Likely Out of Scope",
      confidence: 79,
      matchedBomItems: ["Managed switch replacement support"],
      missingBomItems: ["Ongoing proactive monitoring", "Remote alerting stack"],
      reviewerNotes: [
        "Separate remediation from future-state monitoring proposal.",
        "Require approval before client-facing language is finalized."
      ]
    }
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Open Dispatches",
    value: "24",
    detail: "7 need scope action today",
    tone: "default"
  },
  {
    label: "Scope Confidence",
    value: "81%",
    detail: "Average across active drafts",
    tone: "positive"
  },
  {
    label: "At-Risk Visits",
    value: "5",
    detail: "Traffic, weather, or approval blockers",
    tone: "warning"
  },
  {
    label: "Out-of-Scope Flags",
    value: "2",
    detail: "Awaiting reviewer signoff",
    tone: "danger"
  }
];

export const queues: QueueItem[] = [
  {
    id: "queue-1",
    title: "Needs Scope",
    description: "Dispatches that need a first-pass scope draft before scheduling lock.",
    count: 7
  },
  {
    id: "queue-2",
    title: "Needs Attention",
    description: "Visits carrying blockers, high-risk travel, or approval gaps.",
    count: 5
  },
  {
    id: "queue-3",
    title: "Ready for Review",
    description: "Draft scopes with enough detail to move into supervisor review.",
    count: 4
  }
];

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "Hudson Exchange Refresh",
    clientName: "Hudson Capital",
    phase: "Warranty Support",
    soldScopeSummary: "Conference room AV support, DSP tuning, and closeout training."
  },
  {
    id: "proj-2",
    name: "Midtown Briefing Center",
    clientName: "Marlowe & Finch",
    phase: "Managed Services",
    soldScopeSummary: "Video wall support and quarterly training allotment."
  },
  {
    id: "proj-3",
    name: "Harbor Point Studio",
    clientName: "Harbor Point Media",
    phase: "Break/Fix",
    soldScopeSummary: "Network remediation tied to installed AV systems, excluding ongoing monitoring."
  }
];
