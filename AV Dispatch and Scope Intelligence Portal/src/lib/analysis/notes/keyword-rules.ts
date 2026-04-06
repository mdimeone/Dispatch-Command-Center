import { KeywordRule } from "@/types/domain";

export const noteKeywordRules: KeywordRule[] = [
  {
    id: "parts-rma-shipping",
    pattern:
      String.raw`\b(rma|back\s*order(?:ed)?|on\s*order|awaiting\s*parts|ship(?:ment|ping)?|tracking|eta|deliver(?:ed|y|ies)?)\b`,
    category: "PARTS",
    ownerOverride: "Case Manager",
    stepTextOverride:
      "Confirm delivery receipt; track RMA or parts ETA; schedule install upon arrival.",
    dueDateTrigger: true,
    outputFlags: ["parts-related", "shipment-mentioned"],
    skillTags: ["Shipping / Logistics"],
    priority: 100
  },
  {
    id: "approval-po-quote",
    pattern:
      String.raw`\b(approval|approve(?:d|s|ing)?|purchase\s*order|quote|pricing|estimate|sow|p\.?\s*o\.?)\b`,
    category: "APPROVAL",
    ownerOverride: "Client",
    stepTextOverride: "Obtain client approval or PO, or send quote as needed.",
    dueDateTrigger: false,
    outputFlags: ["approval-needed"],
    skillTags: ["Client Coordination"],
    priority: 90
  },
  {
    id: "scheduling-onsite",
    pattern:
      String.raw`\b(schedule(?:d|ing)?|dispatch(?:ed|ing)?|on\s*site|onsite|availability|re[\s-]?schedule(?:d|s|ing)?|return\s*visit(?:s)?|arrival|window)\b`,
    category: "SCHEDULING",
    ownerOverride: "Case Manager",
    stepTextOverride: "Coordinate and schedule the next onsite visit.",
    dueDateTrigger: true,
    outputFlags: ["scheduling-needed"],
    skillTags: ["Client Coordination"],
    priority: 85
  },
  {
    id: "it-networking",
    pattern:
      String.raw`\b(vlan|ptp|clock|switch|ports?|dns|gateway|subnet|network|firewall|routes?|dhcp|ntp|ip(?:v4|v6)?)\b|(?<!\d)(?:\d{1,3}\.){3}\d{1,3}(?!\d)`,
    category: "IT",
    ownerOverride: "Tier 3",
    stepTextOverride:
      "Engage client IT or RCE to validate switchport, VLAN, PTP, and related network settings; include screenshots or logs.",
    dueDateTrigger: false,
    outputFlags: ["remote-support-suggested"],
    skillTags: ["Networking", "Remote Support"],
    priority: 95
  },
  {
    id: "vendor-oem-platform",
    pattern:
      String.raw`\b(planar|evertz|barco|crestron|shure|biamp|qsc|extron|logitech|poly|cisco|samsung|sony|nec|hp|dell)\b`,
    category: "VENDOR",
    ownerOverride: "Tier 3",
    stepTextOverride: "Follow up with the vendor, manufacturer, or RCE group for firmware or fix guidance.",
    dueDateTrigger: false,
    outputFlags: ["vendor-followup-suggested"],
    skillTags: ["Vendor Coordination"],
    priority: 70
  },
  {
    id: "testing-validation",
    pattern:
      String.raw`\b(test(?:ed|ing)?|verify(?:ing|ied)?|validat(?:e|ed|ing|ion)?|calibrat(?:e|ed|ing|ion)?|configur(?:e|ed|ing|ation)?|firmware|update(?:d|s|ing)?|patch(?:ed|es|ing)?|reproduc(?:e|ed|ing|tion)?|burn[\s-]?in|stabilit(?:y|ies))\b`,
    category: "TEST",
    ownerOverride: "Technician",
    stepTextOverride: "After the fix, run functional tests and capture pass or fail notes and photos.",
    dueDateTrigger: false,
    outputFlags: [],
    skillTags: ["General Troubleshooting"],
    priority: 50
  },
  {
    id: "client-confirmation",
    pattern: String.raw`\b(confirm(?:ation|ed|ing)?|sign[\s-]?off|accept(?:ance|ed|ing)?|uat)\b`,
    category: "CONFIRM",
    ownerOverride: "Case Manager",
    stepTextOverride: "Get client confirmation that the issue is resolved before closure.",
    dueDateTrigger: false,
    outputFlags: [],
    skillTags: ["Client Coordination"],
    priority: 40
  },
  {
    id: "remote-support-rce",
    pattern:
      String.raw`\bone\s*beyond\b|\bonebeyond\b|\bacp[\s-]*r\b|\bacpr\b|\baec\b|\bnetwork(ing)?\b|\b(vlan|dhcp|dns|ip(?:v4|v6)?|gateway|subnet|switch|router|firewall|poe|port\s*config(?:uration)?)\b|\bdante\b|\bseer\s*vision\b|\bseervision\b|\bseervison\b|(?<![a-z0-9])ui(?![a-z0-9])|\bscripts?\b|\bscripting\b|\blua\b`,
    category: "Remote Support",
    ownerOverride: "Tier 3",
    stepTextOverride: "Schedule RCE support remotely.",
    dueDateTrigger: false,
    outputFlags: ["remote-support-suggested"],
    skillTags: ["Remote Support", "Networking", "Programming"],
    priority: 98
  },
  {
    id: "remote-support-programming",
    pattern: String.raw`\bC\s*#\b|\bC\s*sharp\b`,
    category: "Remote Support",
    ownerOverride: "Tier 3",
    stepTextOverride: "Schedule programming support remotely.",
    dueDateTrigger: false,
    outputFlags: ["remote-support-suggested"],
    skillTags: ["Programming", "Remote Support"],
    priority: 97
  },
  {
    id: "remote-support-cable-sat",
    pattern:
      String.raw`\b(cable(?!\s*hdmi)\b|sat(?:ellite)?|set[-\s]*top\s*box|stb|receiver|tuner|coax|rg6|rf)\b|no\s*signal|signal\s*(lost|loss|weak|low)|searching\s*for\s*(signal|satellite)|acquiring\s*signal|channel\s*(missing|not\s*available|unavailable)|guide\s*(down|not\s*updating|missing)|auth(orization)?\s*(error|failed)|subscription\s*(required|expired)|outage|service\s*(down|out)`,
    category: "Remote Support",
    ownerOverride: "Tier 3",
    stepTextOverride: "Check with Diversified Cable or Sat. to confirm contract and signal status.",
    dueDateTrigger: false,
    outputFlags: ["remote-support-suggested"],
    skillTags: ["Remote Support", "Vendor Coordination"],
    priority: 96
  },
  {
    id: "carrier-ups",
    pattern:
      String.raw`\b(ups|u\.p\.s\.|united\s*parcel\s*service|quantum\s*view|my\s*choice|ups\s*tracking)\b|\b1Z[0-9A-Z]{16}\b`,
    category: null,
    ownerOverride: "UPS",
    stepTextOverride: "UPS tracking number mentioned.",
    dueDateTrigger: null,
    outputFlags: ["shipment-mentioned"],
    skillTags: ["Shipping / Logistics"],
    priority: 60
  },
  {
    id: "carrier-fedex-basic",
    pattern:
      String.raw`\b(fedex|fed\s*ex|federal\s*express|fedex\s*tracking)\b|\b(\d{12}|\d{15}|\d{20}|\d{22})\b`,
    category: null,
    ownerOverride: "FedEx",
    stepTextOverride: "FedEx tracking number mentioned.",
    dueDateTrigger: null,
    outputFlags: ["shipment-mentioned"],
    skillTags: ["Shipping / Logistics"],
    priority: 59
  },
  {
    id: "carrier-fedex-context",
    pattern:
      String.raw`\b(fedex|fed\s*ex|federal\s*express)\b[\s\S]{0,40}\btracking\b|\btracking\b[\s\S]{0,40}\b(fedex|fed\s*ex|federal\s*express)\b|\b(fedex)\b|\b(\d{12}|\d{15}|\d{20}|\d{22})\b(?=[\s\S]*\b(fedex|fed\s*ex)\b)`,
    category: null,
    ownerOverride: "FedEx",
    stepTextOverride: "FedEx tracking number mentioned.",
    dueDateTrigger: null,
    outputFlags: ["shipment-mentioned"],
    skillTags: ["Shipping / Logistics"],
    priority: 58
  }
];

