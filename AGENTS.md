# Ginjou Agent Guide

This document serves as a guide for AI agents to understand and develop the Ginjou project.

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

This project uses ESLint for code quality and consistency.

To check the code against the linting rules:

```bash
pnpm lint
```

* **Show Must Go On**：每次準備結束當前回合（相當於 Claude Code `Stop` hook 的時機）時，必須用 Question Tool 提議 2–4 個具體下一步選項。禁止只寫「完成了」或用開放式「要繼續嗎？」收尾。使用者明確說「結束／就這樣」時才可豁免。
