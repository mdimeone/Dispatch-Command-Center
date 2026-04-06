export const scopePromptStrategy = {
  generate: [
    "Summarize the case goal in one sentence.",
    "Draft structured scope language using technician notes and visit history.",
    "Separate corrective work from enhancement or change-order language."
  ],
  validate: [
    "Compare scope claims against sold BOM context.",
    "Return uncertainty explicitly when support evidence is weak.",
    "List reviewer follow-up questions before making a high-risk determination."
  ]
};
