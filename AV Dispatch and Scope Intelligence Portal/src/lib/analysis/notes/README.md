This folder contains the native note-enrichment layer for dispatch and case history.

Purpose:

- clean raw note text from workbook or API sources
- apply deterministic keyword and regex rules
- produce structured flags, next-step suggestions, and skill signals
- preserve a path for optional AI summarization later

Design rules:

- keep source parsing separate from note analysis
- analyze case notes and work-order notes independently
- use deterministic rules for routing-critical flags
- use AI only as an optional enhancement layer for summarization or ambiguity handling
