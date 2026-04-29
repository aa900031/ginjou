---
name: eval-ginjou
description: >
  Run the ginjou skill regression eval — prepare iteration prompts, dispatch
  with_skill / without_skill subagents, grade outputs, and produce a benchmark +
  HTML review. Use this skill whenever the user asks to evaluate, benchmark,
  regression-test, or grade the ginjou skill (skills/ginjou/), or after editing
  skills/ginjou/SKILL.md or skills/ginjou/references/** to confirm the skill
  has not regressed. Triggers: "/eval-ginjou", "run ginjou eval", "benchmark
  ginjou", "regression test ginjou", "rerun ginjou skill eval", "ginjou
  pass rate".
---

# eval-ginjou — ginjou skill regression eval

Drive the full benchmark for the `ginjou` skill at `skills/ginjou/`. The
developer ran this skill; do the rest yourself.

## Inputs (ask only if ambiguous)

- **iteration**: integer, default `1`. Folder will be `iteration-<N>/` next to
  this SKILL.md.
- **mode**: one of `both` / `with_skill` / `without_skill`. Default `with_skill`
  (regression mode — fastest; with_skill must hold ≥ 90% pass rate).
- **cases**: `all` or comma-separated subset of `dir_name` from
  `references/evals.json` (e.g. `vue-basic-auth-login,vue-i18n-with-vue-i18n`).

If the user says "/eval-ginjou" with no arguments, default to
`iteration=1, mode=with_skill, cases=all` and tell them you're running
regression mode (with_skill only).

## Layout

```
.agents/skills/eval-ginjou/
├── SKILL.md                        # this file
├── .gitignore                      # iteration-*/
├── scripts/
│   └── run-eval.mjs                # prepare/validate/fix/finalize/all
├── references/
│   ├── evals.json                  # 10 frozen cases (single source of truth)
│   └── grader-schema.md            # full grading.json schema (load on demand)
└── iteration-*/                    # gitignored scratch zone
    ├── evals.json                  # snapshot copied by `prepare`
    ├── _prompts/<case>.<arm>.<dispatch|grader>.md
    ├── benchmark.json / benchmark.md
    ├── review.html
    └── <dir_name>/{with,without}_skill/
        ├── transcript.md
        ├── outputs/{answer.md, metrics.json}
        └── grading.json
```

## Hard rules

- **Never edit `skills/ginjou/**`** during an eval — that is the artifact
  under test. If the user wants to fix a regression, exit this skill first.
- **Never `git add` anything inside `iteration-*/`** — it's gitignored scratch.
- **Never paraphrase dispatch / grader prompts.** `prepare` writes them; pass
  the file contents to `runSubagent` verbatim. Paraphrasing breaks isolation.
- **Never grade inline.** Always spawn a dedicated grader subagent per run.
  Inline grading skips contamination checks and produces malformed
  `grading.json`.
- If `references/evals.json` or `scripts/run-eval.mjs` are missing, stop and tell
  the user this workspace is missing the eval harness.

## Procedure

### 1. Prepare

```
node .agents/skills/eval-ginjou/scripts/run-eval.mjs prepare <N>
```

Emits 4 files per case (`<dir_name>.<arm>.dispatch.md`,
`<dir_name>.<arm>.grader.md` for arms `with_skill` and `without_skill`) into
`iteration-<N>/_prompts/`. Confirm count = `cases × 4`. If not, stop.

### 2. Dispatch (answer the prompts)

For every `<dir_name>.<arm>.dispatch.md` matching the selected `mode` + `cases`:

- Invoke `runSubagent` (default agent — **not** Explore; subagents must write
  files).
- `description`: 3–5 words like `"eval dispatch <dir_name> <arm>"`.
- `prompt`: the **entire literal contents** of the dispatch.md file. The file
  already lists allowed reads, forbidden paths, and required absolute output
  paths. Do not paraphrase.

Dispatch in parallel batches of up to 6 to keep latency reasonable; wait for
each batch before starting the next.

After all dispatches: verify every expected `outputs/answer.md` exists.
Re-dispatch missing ones once; then move on.

### 3. Grade

For every `<dir_name>.<arm>.grader.md` matching the selected runs:

- Invoke `runSubagent` with the **entire literal contents** of the grader.md
  file. The grader writes `grading.json` per the schema in
  `references/grader-schema.md`.

Same parallel batching as dispatch.

### 4. Validate + auto-fix

```
node .agents/skills/eval-ginjou/scripts/run-eval.mjs validate <N>
```

If schema errors:

```
node .agents/skills/eval-ginjou/scripts/run-eval.mjs fix <N>
node .agents/skills/eval-ginjou/scripts/run-eval.mjs validate <N>
```

If still failing, stop and surface the failing files. Do **not** finalize.

### 5. Finalize

```
node .agents/skills/eval-ginjou/scripts/run-eval.mjs finalize <N>
```

Writes `iteration-<N>/benchmark.json` and `review.html`. (`finalize` already
runs `validate` + `fix` internally; you can skip step 4 and call `finalize`
directly if confident.)

### 6. Report

Reply with:

- Iteration folder absolute path.
- Mean `with_skill` pass rate (and `without_skill` if it ran), pulled from
  `benchmark.json`.
- One-line per-case PASS / PARTIAL / FAIL summary for the with_skill arm.
- Any contamination flags (`grading.json:contamination.clean === false`).
- Absolute path to `review.html`.

Do **not** propose a git commit; the iteration folder is scratch.

## Coverage (references/evals.json)

10 application-layer cases. Each expectation pins down one
"fabricated-but-plausible API" trap to make the eval discriminative.

| # | dir_name | Topic |
|---|---|---|
| 1 | vue-posts-list-rest | Vue + Vue Router + REST list (pagination/sort/search) |
| 2 | vue-users-crud-supabase | Vue + Supabase full CRUD + redirect/keepQuery |
| 3 | vue-basic-auth-login | Vue auth contract, 401 vs 403 |
| 4 | nuxt-ssr-directus-list | Nuxt + Directus SSR list (`useAsyncList`) |
| 5 | vue-realtime-orders-dashboard | Supabase realtime + transport fallback |
| 6 | vue-authorization-rbac | `defineAuthzContext` + `useCanAccess` |
| 7 | vue-i18n-with-vue-i18n | `@ginjou/with-vue-i18n` + `useTranslate`/`useLocale` |
| 8 | vue-notifications-toast | `defineNotificationContext` + undoable |
| 9 | vue-infinite-list-rest | `useGetInfiniteList` widget (non page controller) |
| 10 | vue-edit-form-optimistic | `useEdit` + `mutationMode: 'optimistic'` |

Snapshot baseline (do not commit reports; this is the bar to beat):

| Group | pass_rate | runs |
|---|---|---|
| with_skill | 96.7% ± 7.0% | 10 |
| without_skill | 30.5% ± 24.1% | 5 |

## Adding a new case

1. Append to `.agents/skills/eval-ginjou/references/evals.json` (skill
   references root, NOT inside `iteration-N/`): `id`, `dir_name`, `prompt`,
   `expected_output`, `files`, `expectations[]`.
2. Each expectation should pin a specific "fabricated API trap" (e.g.
   `useCan` vs `useCanAccess`, `{ allowed }` vs `{ can }`).
3. Run `prepare` → dispatch → grade → `finalize`.

## Starting a new iteration (rare)

Only when you change `expectations` / `prompts` and want a formal A/B
comparison. Plain reruns can overwrite the existing iteration.

```
node .agents/skills/eval-ginjou/scripts/run-eval.mjs prepare --next
```

`finalize` automatically passes `--previous-workspace iteration-<N-1>` for diff.
