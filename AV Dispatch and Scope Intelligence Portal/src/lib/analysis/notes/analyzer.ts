import {
  KeywordRule,
  NoteAnalysisResult,
  SignalMatch,
  SkillSignal
} from "@/types/domain";
import { noteKeywordRules } from "@/lib/analysis/notes/keyword-rules";

const RULE_FLAGS = {
  partsRelated: "parts-related",
  shipmentMentioned: "shipment-mentioned",
  approvalNeeded: "approval-needed",
  schedulingNeeded: "scheduling-needed",
  remoteSupportSuggested: "remote-support-suggested",
  vendorFollowupSuggested: "vendor-followup-suggested"
} as const;

const DEFAULT_RESULT: NoteAnalysisResult = {
  summary: "",
  categories: [],
  flags: {
    partsRelated: false,
    shipmentMentioned: false,
    approvalNeeded: false,
    schedulingNeeded: false,
    remoteSupportSuggested: false,
    vendorFollowupSuggested: false,
    repeatDispatchRisk: false
  },
  skillSignals: [],
  matchedRules: []
};

export function cleanNoteText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .replace(/\[code\]/gi, " ")
    .replace(/\[\/code\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/CGBANNERINDICATOR/gi, " ")
    .replace(/EXTERNAL EMAIL/gi, " ")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function analyzeNoteText(
  rawText: string | null | undefined,
  rules: KeywordRule[] = noteKeywordRules
): NoteAnalysisResult {
  const cleanedText = cleanNoteText(rawText);

  if (!cleanedText) {
    return { ...DEFAULT_RESULT };
  }

  const orderedRules = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const categories = new Set<string>();
  const skillSignals = new Set<SkillSignal>();
  const matchedRules = new Set<string>();
  const signalMatches: SignalMatch[] = [];

  let ownerSuggestion: string | undefined;
  let nextStepSuggestion: string | undefined;
  let dueDateTrigger = false;

  const flags = { ...DEFAULT_RESULT.flags };

  for (const rule of orderedRules) {
    const expression = new RegExp(rule.pattern, "gi");
    const matches = [...cleanedText.matchAll(expression)].map((match) => match[0]).filter(Boolean);

    if (matches.length === 0) {
      continue;
    }

    matchedRules.add(rule.id);

    if (rule.category) {
      categories.add(rule.category);
    }

    for (const skillTag of rule.skillTags ?? []) {
      skillSignals.add(skillTag);
    }

    applyRuleFlags(rule, flags);

    if (!ownerSuggestion && rule.ownerOverride) {
      ownerSuggestion = rule.ownerOverride;
    }

    if (!nextStepSuggestion && rule.stepTextOverride) {
      nextStepSuggestion = rule.stepTextOverride;
    }

    if (rule.dueDateTrigger === true) {
      dueDateTrigger = true;
    }

    signalMatches.push({
      ruleId: rule.id,
      category: rule.category ?? "UNCATEGORIZED",
      matchedText: uniqueValues(matches),
      confidence: 100
    });
  }

  flags.repeatDispatchRisk = detectRepeatDispatchRisk(cleanedText);

  const summary = buildSummary(cleanedText, signalMatches);

  return {
    summary,
    categories: [...categories],
    flags,
    skillSignals: [...skillSignals],
    ownerSuggestion,
    nextStepSuggestion,
    dueDateTrigger,
    matchedRules: [...matchedRules]
  };
}

function applyRuleFlags(rule: KeywordRule, flags: NoteAnalysisResult["flags"]) {
  const outputs = new Set(rule.outputFlags ?? []);

  if (rule.category === "PARTS") {
    outputs.add(RULE_FLAGS.partsRelated);
    outputs.add(RULE_FLAGS.shipmentMentioned);
  }

  if (rule.category === "APPROVAL") {
    outputs.add(RULE_FLAGS.approvalNeeded);
  }

  if (rule.category === "SCHEDULING") {
    outputs.add(RULE_FLAGS.schedulingNeeded);
  }

  if (rule.category === "VENDOR") {
    outputs.add(RULE_FLAGS.vendorFollowupSuggested);
  }

  if (rule.category === "IT" || rule.category === "Remote Support") {
    outputs.add(RULE_FLAGS.remoteSupportSuggested);
  }

  flags.partsRelated ||= outputs.has(RULE_FLAGS.partsRelated);
  flags.shipmentMentioned ||= outputs.has(RULE_FLAGS.shipmentMentioned);
  flags.approvalNeeded ||= outputs.has(RULE_FLAGS.approvalNeeded);
  flags.schedulingNeeded ||= outputs.has(RULE_FLAGS.schedulingNeeded);
  flags.remoteSupportSuggested ||= outputs.has(RULE_FLAGS.remoteSupportSuggested);
  flags.vendorFollowupSuggested ||= outputs.has(RULE_FLAGS.vendorFollowupSuggested);
}

function detectRepeatDispatchRisk(text: string) {
  return /\b(return\s*visit|re[\s-]?schedule|another\s+visit|go\s+back\s+onsite|still\s+not\s+solved|issue\s+still\s+not\s+solved)\b/i.test(
    text
  );
}

function buildSummary(text: string, matches: SignalMatch[]) {
  const firstSentence = text.split(/\.\s+|\n+/).find((part) => part.trim().length > 0)?.trim() ?? "";

  if (firstSentence.length > 0 && firstSentence.length <= 220) {
    return firstSentence;
  }

  if (matches.length > 0) {
    const categories = uniqueValues(matches.map((match) => match.category)).join(", ");
    return `Matched note signals: ${categories}.`;
  }

  return text.slice(0, 220).trim();
}

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}
