# Skill Evaluation Process

This document standardizes the Ginjou skill hit-rate evaluation workflow and keeps the scenario set extensible.

## Goals

1. Compare two skill versions with the same scenario set.
2. Measure trigger quality, routing quality, and assumption risk.
3. Keep scenario definitions versioned and easy to expand.

## Source of Truth

- Scenario bank: [skill-eval-scenarios.v1.yaml](./skill-eval-scenarios.v1.yaml)
- Run report template: [report-template.md](../assets/report-template.md)
- Subagent prompt template: [subagent-prompt-template.md](./subagent-prompt-template.md)
- Checklist: [rerun-checklist.md](./rerun-checklist.md)

## Scoring Rubric

Per scenario (max 5):

- Trigger hit: `0 | 0.5 | 1`
- Reference routing: `0 | 1 | 1.5 | 2`
- No hallucination / unnecessary assumption: `0 | 0.5 | 1`
- Backend-specific coverage: `0 | 0.5 | 1`

Total score formula:

`sum(all scenario scores)`

Max score formula:

`scenario_count * 5`

## Standard Run Procedure

1. Pick two compared skills.
2. Create a dated run report in `.data/reports/` from the shared template before doing any scoring.
3. Copy the scenario version and scenario ids from the scenario bank into the new run report.
4. Run one subagent for Candidate A.
5. Run one subagent for Candidate B.
6. Fill the report with scores, totals, hit counts, and failure modes.
7. If improving one candidate, edit only that candidate and rerun it with the same scenario version.

## Extending the Scenario Bank

1. Append new scenarios in [skill-eval-scenarios.v1.yaml](./skill-eval-scenarios.v1.yaml).
2. Keep ids stable and unique (`S01`, `S02`, ...).
3. Add new scenarios with the next id (`S10`, `S11`, ...).
4. Add tags and expected routing references for every scenario.

## Compatibility Policy

- `v1` is backward-compatible for trend analysis.
- If a breaking change is needed, create `skill-eval-scenarios.v2.yaml` beside the existing file.
