---
name: rerun-ginjou-skill-eval
description: 'Use when rerunning the Ginjou skill hit-rate evaluation, comparing two skill versions, regenerating a dated evaluation report, or re-scoring the shared scenario bank with subagents.'
argument-hint: 'candidate A path, candidate B path, optional run label'
user-invocable: true
disable-model-invocation: true
---

# Rerun Ginjou Skill Eval

Use this skill when a developer wants a repeatable way to rerun the Ginjou skill evaluation from chat.

## Required Inputs

- Candidate A skill path
- Candidate B skill path
- Optional run label

## Source of Truth

- Process: [process.md](./references/process.md)
- Scenario bank: [skill-eval-scenarios.v1.yaml](./references/skill-eval-scenarios.v1.yaml)
- Run report template: [report-template.md](./assets/report-template.md)
- Subagent prompt template: [subagent-prompt-template.md](./references/subagent-prompt-template.md)
- Checklist: [rerun-checklist.md](./references/rerun-checklist.md)

## Procedure

1. Read the source-of-truth files above before doing any scoring.
2. Ensure `.github/skills/rerun-ginjou-skill-eval/.data/reports/` exists.
3. Immediately create a dated run report at `.github/skills/rerun-ginjou-skill-eval/.data/reports/YYYY-MM-DD-<label>.md` using the shared run template.
4. Copy the scenario version and scenario ids from the scenario bank into the new run report.
5. Fill in Candidate A path, Candidate B path, date, and label before starting any scoring.
6. Use the scenario bank inside this skill folder as the only scenario source.
7. Run one subagent for Candidate A using the same scenario bank and rubric.
8. Run one subagent for Candidate B using the same scenario bank and rubric.
9. Fill the run report with:
   - per-scenario scores
   - aggregate totals
   - hit counts
   - strongest and weakest areas
   - candidate-specific failure modes
10. If the task includes improving one candidate, edit only that candidate and rerun it against the same scenario version.

## Rules

- Do not invent new scenarios during a rerun unless the user explicitly asks to extend the scenario bank.
- Do not compare runs across different scenario versions without saying so explicitly.
- Keep the rubric unchanged within a run.
- Use the same scenario set for baseline and post-change validation.
- Every invocation must create or update a report in `.github/skills/rerun-ginjou-skill-eval/.data/reports/`.

## Invocation

Run this in chat as:

`/rerun-ginjou-skill-eval`

Then provide:

- Candidate A path
- Candidate B path
- Optional label
