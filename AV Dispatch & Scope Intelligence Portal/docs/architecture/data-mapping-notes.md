# Data Mapping Notes

## Temporary source expectations

Likely workbook families:

- dispatch workbook
- case workbook
- BOM workbook
- technician reference workbook
- project context workbook

## Mapping principle

Each source should map into the normalized entities in `src/types/domain.ts` rather than being exposed directly to pages.

## Early mapping targets

- case number
- project name
- visit date
- client and site details
- assigned technicians
- supervisor
- status and urgency
- notes and blockers
- sold-scope/BOM references

## Recommended next step

Create a column-map document for each incoming workbook so the parser layer can evolve without breaking page code.
