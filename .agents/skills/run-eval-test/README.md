# run-eval-test

This skill defines a maintainable regression-testing workflow for other skills.

## What It Does

- converts a skill-testing request into a repeatable test plan
- keeps test topics organized in a registry
- stores each run as a frozen iteration snapshot
- uses `/maintain-skill` for skill creation, evaluation, and iteration

## Current Topic Scope

- list filtering and sorting
- infinite lists
- create/edit pages
- delete confirmation flows
- remote search and select fields
- row actions
- route/setup boundaries
- REST, Supabase, and Directus safety checks
- undoable and realtime behavior

## How to Extend

1. Add or refine a topic in `references/topic-registry.md`.
2. Add new prompts to the next `iteration-N/evals.json` snapshot.
3. Keep the prompt wording realistic and scoreable.
4. Rerun the affected cases with `/maintain-skill`.
