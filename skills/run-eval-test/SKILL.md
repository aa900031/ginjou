---
name: run-eval-test
description: >
  Use when the user wants to design, run, score, and maintain regression tests
  for a skill, especially when the test cases need to stay organized by topic
  and grow over time through a registry plus frozen evaluation snapshots.
---

# Run Eval Test

Use this skill to turn a skill-testing request into a repeatable regression workflow.

## Purpose

This skill helps you test another skill with `/maintain-skill`, score the results,
and keep the test topics maintainable so new case types can be added later without
rewriting the whole suite.

## When to Use

Use this skill when the user wants to:

- test an existing skill against realistic prompts
- measure trigger hit rate, answer correctness, and routing quality
- keep a long-lived topic registry for future regression expansion
- add, split, or rename test case types over time
- run a repeatable skill-quality workflow with `/maintain-skill`

## Core Workflow

1. Identify the target skill under test and the outcome the user cares about.
2. Load the topic registry from `references/topic-registry.md`.
3. If the current prompt set is incomplete, propose topic additions before running.
4. Build or update the frozen iteration snapshot at `iteration-N/evals.json`.
5. Invoke `/maintain-skill` for the target skill test cycle.
6. Run the evaluation set and score each case.
7. If any case is below the pass threshold, stop and ask whether to revise the skill,
   revise the prompt framing, or add a new topic type.
8. After approval, update the registry and snapshot, then rerun the affected cases.

## Topic Maintenance Rules

- Treat `references/topic-registry.md` as the source of truth for topic names and scope.
- Keep prompt templates generic enough to be reused, but specific enough to be scored.
- Split a topic when one prompt can no longer be scored with a single clear expectation.
- Merge topics only when their routing and scoring rules are the same.
- Keep one frozen `evals.json` per iteration so historical runs stay comparable.

## Default Topic Model

Use these topic families unless the user asks for a different taxonomy:

- `list.filters`
- `list.sorter`
- `list.infinite`
- `create.edit`
- `delete.confirmation`
- `search.select`
- `row.action`
- `route.setup`
- `backend.rest`
- `backend.supabase`
- `backend.directus`
- `notification.undoable`
- `realtime.refresh`

## Test Output Contract

A good regression report should include:

- the topic being tested
- whether the skill triggered without using the skill name
- the likely reference chain
- the expected safety checks
- the score for trigger quality, routing, and answer correctness
- the next action when the score is not perfect

## Recommended Failure Policy

If a case is not perfect:

- describe the exact missing behavior
- decide whether the fix belongs in the skill, the prompt, or the topic definition
- stop before rerunning unless the user explicitly wants automatic iteration

## Input Snapshot

When you prepare a run, keep these items together:

- the target skill under test
- the frozen eval snapshot for the current iteration
- the topic registry version used to generate the snapshot
- the scoring rubric for the run

## Output Style

Keep reports short and structured. Prefer tables for scores and topic coverage.

## Reference

Start with `references/topic-registry.md` and update it whenever a new topic type is introduced.
