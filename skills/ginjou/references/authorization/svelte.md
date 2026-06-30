# Svelte Authorization

Access-control wiring and composables for Svelte 5. See [Authorization](https://ginjou.pages.dev/raw/guides/authorization.md) for guide-level usage. This file pins the Svelte syntax.

## Contract

```ts
interface Authz {
	access?: AccessCanFn
	getPermissions?: GetPermissionsFn<any, any>
}
```

`access` answers whether one action is allowed. `getPermissions` returns any broader permission structure the app wants to expose, such as roles, grants, or capability lists.

The action-check contract accepts:

- `action`
- optional `resource`
- optional `params`, including `id`
- optional `meta`

It returns `{ can: boolean, reason?: string }`. Use this model for action-level decisions such as whether the current user may edit, delete, create, or view a specific resource.

Use permission snapshots for broader UI decisions such as menus, layouts, or role-driven sections.

See [Authorization](https://ginjou.pages.dev/raw/guides/authorization.md) and [Authentication](https://ginjou.pages.dev/raw/guides/authentication.md) for the contract boundary. Do not use authorization to handle session expiry or login redirects. That stays in the auth layer.

## Wire the provider at the root

`defineAuthz` comes from `@ginjou/core`; authentication and authorization are
**independent** providers — register both when you need login AND role checks.

```svelte
<script lang="ts">
import { defineAuthz } from '@ginjou/core'
import { defineAuthzContext } from '@ginjou/svelte'

defineAuthzContext(defineAuthz({
  access: async ({ resource, action }) => ({ can: (await role()) === 'admin' }),
  getPermissions: async () => ['admin', 'editor'],
}))
</script>
```

## `useCanAccess`

Read results off the returned object (no `.value`):

```svelte
<script lang="ts">
import { useCanAccess } from '@ginjou/svelte'

const edit = useCanAccess(() => ({ resource: 'posts', action: 'edit', params: { id } }))
</script>

{#if edit.data?.can}<button>Edit</button>{/if}
```

## `usePermissions`

`usePermissions()` loads the broader permission snapshot — use it for a UI-wide view of what the user can do (e.g. building a nav menu). For a specific "can this user do X to this resource right now?" gate (per-button, per-route), use `useCanAccess` instead. The two are complementary, not interchangeable: `useCanAccess` answers one action check, `usePermissions` returns the whole snapshot.

## Rules

- Keep policy logic in the authorization provider, not in feature components.
- `access` must resolve to `{ can: boolean, reason?: string }`; `useCanAccess` exposes `data.can` (read off the object, not `data.value`). Return `reason` only when the UI can use it meaningfully.
- Use action checks (`useCanAccess`) for resource-level decisions and permission snapshots (`usePermissions`) for broader UI policy.
- Use an accessor (`() => ({ … })`) when the checked `resource`/`action`/`params` are reactive.
- Keep authentication and authorization responsibilities separate; don't use authz as a substitute for session/redirect handling.
