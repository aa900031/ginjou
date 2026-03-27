# Dashboard Example Design

**Date:** 2026-03-27

## Goal

Create a Nuxt-based dashboard example under `examples/dashboard` that reuses the Nuxt UI dashboard template shell while demonstrating a real Ginjou integration against a mock REST API.

The first version should optimize for speed-to-demo and repository value:

- the application should look and behave like a dashboard, not a bare CRUD demo
- the Orders flow should be genuinely powered by Ginjou
- the implementation should be small enough to maintain as an example inside the monorepo

## Scope

This design covers:

- a standalone Nuxt application in `examples/dashboard`
- Nuxt UI dashboard shell integration
- Ginjou setup for Nuxt with TanStack Query
- a mock REST API that follows the `@ginjou/with-rest-api` conventions
- an e-commerce flavored `orders` resource
- Orders list, show, and edit pages
- a Home page with simple order-driven summary widgets
- a lightweight Settings shell to preserve the dashboard feel

This design does not cover:

- authentication or authorization
- realtime
- multiple fully wired resources
- a production backend
- full parity with every page from the upstream template

## Chosen Direction

The implementation follows a hybrid approach.

- Preserve the visual dashboard shell and selected interactions from the Nuxt UI dashboard template.
- Rebuild the main business flow around a single Ginjou-powered `orders` resource.
- Keep non-essential template pages reduced to shell or simplified content so the example stays focused.

This keeps the result recognizably based on the template while avoiding the trap of copying a large visual starter without demonstrating Ginjou meaningfully.

## Application Structure

The example app should remain isolated from package development work while still consuming workspace packages.

Expected high-level structure:

```text
examples/dashboard/
  app/
    app.vue
    layouts/
    pages/
    components/
    assets/
  server/api/
  shared/ or app/utils/
  nuxt.config.ts
  package.json
  tsconfig.json
```

The template shell should provide:

- sidebar navigation
- dashboard navbar and panel layout
- responsive behavior inherited from Nuxt UI dashboard components
- a Home page and Settings shell for visual completeness

The main navigation should prioritize:

- Home
- Orders
- Settings

## Data Model

The example uses an e-commerce flavored order model so the UI feels familiar and easy to scan.

Primary `Order` fields:

- `id`
- `number`
- `customerName`
- `customerEmail`
- `amount`
- `status`
- `paymentStatus`
- `channel`
- `createdAt`
- `updatedAt`

Suggested status families:

- fulfillment status: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- payment status: `paid`, `pending`, `failed`, `refunded`

This shape is simple enough for a mock REST API while still supporting useful list filters, badges, summary cards, and an edit form.

## Ginjou Integration

The implementation should follow the documented Nuxt integration model instead of adding custom abstraction layers.

At the app root:

- register `@ginjou/nuxt` in `nuxt.config.ts`
- create and provide a single `QueryClient`
- register a default REST fetcher using `createFetcher`
- keep provider registration in `app/app.vue` or `app.vue`

The example should avoid optional providers unless the page actually needs them.

### Page-Level Composables

Because Orders pages are explicit CRUD-style route pages, use Ginjou page controllers:

- Orders list page: `useAsyncList`
- Order detail page: `useAsyncShow`
- Order edit page: `useAsyncEdit`

The Home page is not a CRUD page. It should use lower-level async data composables for summary widgets and recent order slices.

This split demonstrates an important Ginjou principle:

- controllers for route-level CRUD screens
- lower-level composables for custom dashboards and widgets

### Resource Strategy

The first version should keep resource usage simple.

- Use a single `orders` resource.
- Pass the resource name explicitly to pages and composables.
- Do not introduce `defineResourceContext` unless route-aware resource metadata becomes necessary during implementation.

This keeps the example easier to read while still leaving a clear path for future expansion.

## Mock REST API

The mock backend should live inside the Nuxt app under `server/api` and follow the conventions expected by `@ginjou/with-rest-api`.

Requirements:

- `GET /api/orders` supports pagination, sorting, and filtering parameters used by the REST fetcher
- responses include `x-total-count` for list views
- `GET /api/orders/:id` returns a single order
- `PATCH` or `PUT /api/orders/:id` updates editable fields for the edit screen

The data source can be in-memory seeded data or small shared fixtures, as long as the behavior stays deterministic for demo use.

## Page Design

### Home

The Home page should preserve the template feel but source its content from the same order domain.

It should show:

- summary cards such as total revenue, total orders, paid orders, pending orders
- a recent orders section or compact table

The purpose of Home is not deep analytics. It is to show that dashboard widgets can coexist with lower-level Ginjou queries.

### Orders List

The Orders page is the core demonstration screen.

It should include:

- searchable list behavior
- sortable columns
- pagination
- status and payment badges
- clear entry points to detail and edit routes

This page should feel like a polished admin view, not just a plain table.

### Order Show

The detail page should present one order cleanly using the dashboard shell.

It should emphasize:

- key order metadata
- customer information
- financial summary
- navigation back to the list and onward to edit

### Order Edit

The edit page should remain intentionally small.

Editable fields should focus on values that make sense in a demo, such as:

- status
- payment status
- channel

The form should demonstrate a realistic mutation flow without trying to model an entire commerce back office.

### Settings

Settings can remain a lightweight shell page to preserve the dashboard layout vocabulary. It does not need Ginjou wiring in the first version.

## Error Handling

The example should keep error handling pragmatic.

- use standard pending, empty, and error states on Ginjou-backed pages
- avoid introducing a notification provider solely for edit success unless implementation clearly benefits from it
- prefer pessimistic mutation behavior for the edit flow

## Testing Strategy

The first version should include at least one focused test so the example is more than static demo code.

Preferred test targets:

- mock API list behavior, especially pagination and total count handling
- a small helper that derives dashboard stats from orders

The goal is not exhaustive coverage. The goal is to protect the core example behavior with a small amount of meaningful verification.

## Constraints

- Keep the example aligned with official Ginjou Nuxt and REST integration guidance.
- Do not add unnecessary provider layers or app-specific frameworks.
- Prefer clarity over feature count.
- Preserve enough of the template shell that the example still feels like a dashboard starter.
- Keep the Orders flow as the only fully wired resource in v1.

## Verification Strategy

1. Install workspace dependencies for the example.
2. Start the dashboard app and verify the shell renders.
3. Confirm Orders list loads through Ginjou with pagination and sorting.
4. Confirm show and edit routes load data correctly.
5. Run the example-focused test coverage.

## Self-Review

- The scope is intentionally narrow enough for a first implementation pass.
- The design preserves the selected template while giving Ginjou a real role.
- Controllers are used only where route-level CRUD behavior is clear.
- The mock API contract stays compatible with `@ginjou/with-rest-api`.
- Optional concerns such as auth, realtime, and multiple resources are deferred instead of partially implemented.
