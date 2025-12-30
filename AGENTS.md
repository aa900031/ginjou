# Ginjou Agent Guide

This document serves as a guide for AI agents to understand and develop the Ginjou project.

## Project Overview

Ginjou is a headless, framework-agnostic, progressive library for building admin panels, dashboards, and other data-intensive applications. It is inspired by [refine](https://github.com/refinedev/refine) and [react-admin](https://github.com/marmelab/react-admin).

### Core Features

- **Framework-Agnostic:** Use it with Vue, Nuxt, or bring your own framework.
- **Any Backend:** Connect to any backend with ease. Pre-built providers for REST APIs, Supabase, and Directus are available.
- **Authentication & Authorization:** Manage user sessions and control access to resources.
- **Realtime Streaming:** Automatically update state when content changes.

## Monorepo Structure

This project is a monorepo managed by pnpm workspaces and Turbo.

- `packages/`: Contains all the public-facing packages.
  - `core/`: The core framework-agnostic library.
  - `vue/`: The Vue 3 adapter.
  - `nuxt/`: The Nuxt 3, 4 module.
  - `with-*`: Integration packages for various services and libraries.
- `stories/`: Contains Storybook applications for showcasing components and features.
- `internals/`: Contains internal packages used for development, like tsconfig.

## Development

Do not be concerned with linting errors during the initial coding phase. These can be automatically resolved by running `pnpm lint --fix` before finalizing changes.

### Build

To build all packages:

```bash
pnpm build:pkgs
```

To build all Storybook applications:

```bash
pnpm build:sb
```

### Test

To run the entire test suite:

```bash
pnpm test
```

Tests are written using `vitest`. Unit test files should be placed next to the file being tested (e.g., for `packages/core/src/main.ts`, the test file would be `packages/core/src/main.test.ts`).

### Lint

To check the code against the linting rules:

```bash
pnpm lint
```

This project uses ESLint for code quality and consistency.

### Writing Documentation

When writing documentation for Ginjou (especially Guides and Concepts), follow these rules to ensure high quality and consistency:

1.  **Language Style: The S.P.A. Principle**
    *   **Simple**: Use short sentences and direct phrasing. (e.g., "Use `useCreate` to..." instead of "One might utilize `useCreate` in order to...")
    *   **Professional**: Keep technical terms precise (e.g., Composable, Controller, Mutation, Context). Do not dumb down the technology, just the language structure.
    *   **Accessible**: Write for non-native English speakers. Avoid complex idioms, metaphors, or overly academic vocabulary.

2.  **Structure & Content**
    *   **Goal-Oriented**: Start every section with a clear goal. What will the user learn?
    *   **Clean Headers**: Do not use numbered headers (e.g., use "Create", not "1.1 Create").
    *   **Composition Pattern**: When documenting high-level Controllers (like `useEdit`), always explain their **Composition**:
        *   **Data Hooks**: Which low-level hooks are used? (e.g., `useGetOne`, `useUpdateOne`)
        *   **Actions**: What triggers the action? (e.g., `save` button)
        *   **Success Flow**: Explicitly separate "Mutation On Success" (data side effects) from "Controller On Success" (navigation/UI side effects).

3.  **Visual Aids (Mermaid)**
    *   **Logic Flow**: Use diagrams to show how data moves, not just call hierarchies.
    *   **Resource Injection**: Explicitly show `useResource` providing "Resource & Fetcher Name" to downstream hooks.
    *   **Correct Timing**: Ensure arrows reflect the actual sequence (e.g., `On Success` happens *after* the mutation completes).

4.  **Flexibility Emphasis**
    *   Always remind the user that while Controllers are convenient, they are composed of granular parts that can be overridden manually. This reinforces Ginjou's core philosophy of flexibility.
