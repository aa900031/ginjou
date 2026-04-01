---
name: using-ginjou-backends
description: Use when choosing or implementing a Ginjou backend integration, or when answers depend on backend-specific auth or meta query behavior.
---

# Using Ginjou Backends

## Overview

Use this skill when backend choice or backend-specific behavior is the critical factor.

Supported backend families in this repository:
- REST API
- Supabase
- Directus

## Backend Routing Matrix

| Trigger | Backend path |
| --- | --- |
| Generic/custom HTTP API, custom headers/methods/client | REST API |
| Postgrest `select`, `count`, `idColumnName`, Supabase auth types | Supabase |
| Directus `query` fields/filters, `aggregate`, `groupBy`, Directus auth | Directus |

## REST API Notes

- Uses `@ginjou/with-rest-api`
- Data adapter: `createFetcher`
- Auth adapter: custom implementation via `defineAuth`
- Common `meta`: `method`, `headers`

## Supabase Notes

- Uses `@ginjou/with-supabase`
- Data adapter: `createFetcher`
- Auth adapter: `createAuth`
- Common `meta`: `select`, `count`, `idColumnName`
- Login types include password, oauth, otp, otp-token, idtoken, sso

## Directus Notes

- Uses `@ginjou/with-directus`
- Data adapter: `createFetcher`
- Auth adapter: `createAuth`
- Common `meta`: `query`, `aggregate`, `groupBy`
- Login types include password and sso

## Decision Rules

- Start with setup from `using-ginjou-setup` when provider registration is incomplete.
- Use `using-ginjou-resources` for multi-backend selection by `meta.fetcherName`.
- Do not generalize auth payloads across backends.
- Do not generalize `meta` syntax across backends.

## Source Map

- `references/backend-rest-api.md`
- `references/backend-supabase.md`
- `references/backend-directus.md`
- `https://ginjou.pages.dev/raw/backend/rest-api.md`
- `https://ginjou.pages.dev/raw/backend/supabase.md`
- `https://ginjou.pages.dev/raw/backend/directus.md`
- `packages/with-rest-api/src/index.ts`
- `packages/with-supabase/src/index.ts`
- `packages/with-directus/src/index.ts`
