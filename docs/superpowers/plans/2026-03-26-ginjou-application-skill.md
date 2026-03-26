# Ginjou Application Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one repository-scoped Ginjou application skill with focused reference files for setup, resources, controllers, forms, data composables, and providers.

**Architecture:** Keep a single discoverable `SKILL.md` as the routing layer and move detailed guidance into capability-family reference files. Save the supporting design and implementation artifacts under `docs/superpowers` so the repository has a durable record of the chosen structure.

**Tech Stack:** Markdown, repository-scoped agent skills, Ginjou Vue/Nuxt docs, source inspection, VS Code diagnostics.

---

### Task 1: Capture Scope And Baseline Risks

**Files:**
- Create: `docs/superpowers/specs/2026-03-26-ginjou-application-skill-design.md`

- [ ] **Step 1: Write the failing test**

Document the baseline pressure scenario and the likely failure modes that happen without a dedicated skill.

```md
## Verification Strategy

1. Baseline pressure scenario: identify what an agent misses without the skill.
2. Author the skill and references to close those gaps.
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rg -n "Verification Strategy" docs/superpowers/specs/2026-03-26-ginjou-application-skill-design.md`
Expected: no file found yet

- [ ] **Step 3: Write minimal implementation**

Create the design document with goal, scope, layout, reference mapping, and verification strategy.

```md
# Ginjou Application Skill Design

## Goal

Create a single repository-scoped skill that helps an agent implement Ginjou in consumer Vue and Nuxt applications.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rg -n "Ginjou Application Skill Design|Verification Strategy" docs/superpowers/specs/2026-03-26-ginjou-application-skill-design.md`
Expected: both headings found

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-03-26-ginjou-application-skill-design.md
git commit -m "docs: add Ginjou skill design"
```

### Task 2: Author The Repository Skill And References

**Files:**
- Create: `.agents/skills/ginjou-application/SKILL.md`
- Create: `.agents/skills/ginjou-application/references/setup.md`
- Create: `.agents/skills/ginjou-application/references/resources.md`
- Create: `.agents/skills/ginjou-application/references/controllers.md`
- Create: `.agents/skills/ginjou-application/references/forms.md`
- Create: `.agents/skills/ginjou-application/references/data-composables.md`
- Create: `.agents/skills/ginjou-application/references/providers.md`

- [ ] **Step 1: Write the failing test**

Define the required routing table and the six reference files in the main skill skeleton.

```md
## Reference Routing

| If the task is about | Read |
| --- | --- |
| Installation, root wiring, fetchers, framework setup | [references/setup.md](references/setup.md) |
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rg -n "Reference Routing|references/setup.md|references/providers.md" .agents/skills/ginjou-application/SKILL.md`
Expected: no file found yet

- [ ] **Step 3: Write minimal implementation**

Create the main skill and the six focused references with task-routing guidance and project-specific rules.

```md
---
name: ginjou-application
description: Use when building or modifying a Vue or Nuxt application that installs, configures, or implements Ginjou resources, controllers, data composables, authentication, authorization, notifications, or realtime features.
---
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rg -n "name: ginjou-application|Reference Routing|Use this reference" .agents/skills/ginjou-application/SKILL.md .agents/skills/ginjou-application/references/*.md`
Expected: frontmatter, routing table, and reference headings are found

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/ginjou-application
git commit -m "feat: add Ginjou application skill"
```

### Task 3: Add Durable Implementation Record

**Files:**
- Create: `docs/superpowers/plans/2026-03-26-ginjou-application-skill.md`

- [ ] **Step 1: Write the failing test**

Define the required implementation-plan header and task structure.

```md
# Ginjou Application Skill Implementation Plan

**Goal:** Add one repository-scoped Ginjou application skill with focused reference files.
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rg -n "Ginjou Application Skill Implementation Plan|Goal:" docs/superpowers/plans/2026-03-26-ginjou-application-skill.md`
Expected: no file found yet

- [ ] **Step 3: Write minimal implementation**

Create the plan file with tasks for design capture, skill authoring, and verification.

```md
### Task 2: Author The Repository Skill And References
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rg -n "Ginjou Application Skill Implementation Plan|Task 2: Author The Repository Skill And References" docs/superpowers/plans/2026-03-26-ginjou-application-skill.md`
Expected: both strings found

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-03-26-ginjou-application-skill.md
git commit -m "docs: add Ginjou skill plan"
```

### Task 4: Verify Skill Guidance Quality

**Files:**
- Modify: `.agents/skills/ginjou-application/SKILL.md`
- Modify: `.agents/skills/ginjou-application/references/*.md`

- [ ] **Step 1: Write the failing test**

Use one pressure scenario that requires setup, resources, controllers, providers, and framework-specific decisions.

```md
Scenario: add a posts list page and edit form with auth, authz, notifications, and realtime in a Vue or Nuxt app.
```

- [ ] **Step 2: Run test to verify it fails**

Run: a read-only subagent baseline before the skill is consulted
Expected: baseline misses at least one of route-resource alignment, Nuxt SSR async composables, or provider boundaries

- [ ] **Step 3: Write minimal implementation**

Adjust skill wording so the routing table and decision rules explicitly close the baseline gaps.

```md
- Nuxt apps use `@ginjou/nuxt`; do not add `defineRouterContext`, and prefer async query/controller composables for SSR-backed views.
```

- [ ] **Step 4: Run test to verify it passes**

Run: a second read-only subagent that reads `.agents/skills/ginjou-application/SKILL.md` and the relevant references
Expected: the returned plan explicitly routes through setup, resources, controllers or forms, and providers with Vue/Nuxt-specific handling

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/ginjou-application
git commit -m "test: verify Ginjou skill guidance"
```
