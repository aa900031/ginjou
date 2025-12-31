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

1.  **Language & Tone**
    *   **English ONLY**: All technical documentation must be written in English.
    *   **Professional & Neutral**: Maintain a professional technical tone. Avoid "blogger" style language (e.g., "Hey everyone!", "diving into", "breeze").
    *   **The S.P.A. Principle**:
        *   **Simple**: Use short sentences and direct phrasing. (e.g., "Use `useCreate` to..." instead of "One might utilize `useCreate` in order to...")
        *   **Professional**: Keep technical terms precise (e.g., Composable, Controller, Mutation, Context).
        *   **Accessible**: Write for non-native English speakers. Avoid complex idioms or metaphors.

2.  **Structure & Patterns**
    *   **Frontmatter**: Always include YAML frontmatter with `title` and `description`.
    *   **Header Naming**: Use **Setup** for provider registration sections (avoid "Registration" or "Integration").
    *   **Clean Headers**: Do not use numbered headers or redundant suffixes (e.g., use "Vue", not "Vue Integration").
    *   **Installation**: Use Nuxt Content's `::code-group` to display installation commands for `pnpm`, `yarn`, `npm`, and `bun`.
    *   **Root Configuration**:
        *   For Nuxt, always provide examples in `app.vue` or `app/app.vue` rather than plugins to ensure SSR consistency.
    *   **Composition Pattern**: When documenting high-level Controllers (like `useEdit`), always explain their **Composition**:
        *   **Data Composables**: Which low-level hooks are used? (e.g., `useGetOne`, `useUpdateOne`)
        *   **Actions**: What triggers the action?
        *   **Success Flow**: Explicitly separate "Mutation On Success" from "Controller On Success".

3.  **Backend Documentation**
    *   **Setup**: Include a **Setup** section that demonstrates how to integrate the provider with all supported frontend frameworks (Vue and Nuxt). Use `App.vue` for Vue and `app.vue` for Nuxt.
    *   **Mapping**: Clearly explain how the Ginjou provider maps to the underlying service API (e.g., how `meta` properties map to Postgrest syntax in Supabase).
    *   **Auth Support**: Analyze the source code to list supported authentication methods (e.g., OAuth, OTP, Password) and how to use them via `login` params.

4.  **Visual Aids (Mermaid)**
    *   **Logic Flow**: Use diagrams to show how data moves, not just call hierarchies.
    *   **Resource Injection**: Explicitly show `useResource` providing "Resource & Fetcher Name" to downstream hooks.
    *   **Correct Timing**: Ensure arrows reflect the actual sequence (e.g., `On Success` happens *after* the mutation completes).

5.  **Flexibility Emphasis**
    *   Always remind the user that while Controllers are convenient, they are composed of granular parts that can be overridden manually.
