# Ginjou Application Skill Design

**Date:** 2026-03-26

## Goal

Create a single repository-scoped skill that helps an agent implement Ginjou in consumer Vue and Nuxt applications. The skill should route the agent to focused reference files instead of splitting the capability into multiple separately discoverable skills.

## Scope

This skill covers:

- installation and root setup
- data controllers such as `useList`, `useShow`, and `useInfiniteList`
- form controllers such as `useCreate` and `useEdit`
- lower-level data composables such as `useGetList`, `useCreateOne`, and `useUpdateMany`
- authentication
- authorization
- notifications
- realtime
- resources

This skill does not cover modifying Ginjou's monorepo internals or authoring upstream framework documentation.

## Design Direction

The final shape is a single entry skill with API-family references.

- The main `SKILL.md` stays short and optimized for discovery.
- The main file performs task routing and decision-making.
- Detailed guidance lives in reference files grouped by capability family rather than by end-to-end tutorial flow.
- The dominant structure is API-family oriented, but the top-level instructions stay task-oriented so the skill is practical during implementation.

## Rationale

This structure matches how Ginjou is documented and implemented:

- setup is separate from page logic
- resources are a foundational contract layer
- controllers sit above lower-level composables
- providers are independent capabilities that can be progressively added

This also addresses the baseline pressure scenario. Without a dedicated skill, an agent is likely to miss framework-specific setup, route-to-resource alignment, provider boundaries, and Nuxt SSR constraints.

## File Layout

```text
.agents/skills/ginjou-application/
  SKILL.md
  references/
    setup.md
    resources.md
    controllers.md
    forms.md
    data-composables.md
    providers.md
```

## Main Skill Responsibilities

- declare when the skill should be used
- define the consumer-application boundary
- route the agent to the correct reference before coding
- enforce controller-first and root-provider-first defaults
- remind the agent to inspect official docs or source when details are unclear

## Reference Responsibilities

- `setup.md`: package choice, root registration, Vue vs Nuxt differences, fetcher selection
- `resources.md`: route patterns, nested resources, resource metadata, multi-backend binding
- `controllers.md`: page-level list, show, infinite list, and select flows
- `forms.md`: create, edit, delete, mutation modes, form-state separation
- `data-composables.md`: lower-level query and mutation primitives, batch operations, custom orchestration
- `providers.md`: auth, authz, notifications, realtime

## Constraints

- Keep only one discoverable skill.
- Move complexity into references rather than sibling skills.
- Optimize for Vue and Nuxt equally.
- Use existing docs and source as the authority.
- Keep the main skill concise enough for reliable discovery.

## Verification Strategy

1. Baseline pressure scenario: identify what an agent misses without the skill.
2. Author the skill and references to close those gaps.
3. Run a second pressure scenario that explicitly reads the created skill and references.
4. Check the new markdown files for diagnostics.

## Self-Review

- The scope is focused on consumer-side implementation rather than monorepo contribution.
- The structure remains one skill, consistent with the user's request.
- Each requested capability maps to exactly one primary reference.
- The design avoids redundant or overlapping sibling skills.
