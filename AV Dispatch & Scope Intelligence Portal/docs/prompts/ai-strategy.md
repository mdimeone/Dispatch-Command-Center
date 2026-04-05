# AI Prompt Strategy Notes

## Initial use cases

- Draft scope text from case details and prior notes
- Rewrite technician shorthand into polished client-safe language
- Compare scope language against sold-scope and BOM references
- Generate reviewer notes and missing-data checklists

## Guardrails

- Label generated content clearly
- Preserve the inputs used for major generated outputs
- Avoid presenting confidence as certainty
- Require reviewer confirmation for likely out-of-scope findings

## Prompt design direction

- Separate generation prompts from validation prompts
- Keep project/BOM context modular
- Return structured sections plus reviewer commentary
- Version prompt templates as the workflow matures
