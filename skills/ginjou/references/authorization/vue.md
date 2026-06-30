# Vue Authorization

Use this reference for Vue authz wiring and authz composables. See [Authorization](https://ginjou.pages.dev/raw/guides/authorization.md) for guide-level usage.

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

## `defineAuthzContext`

Register the authorization provider once at the app root.

> ⚠️ **Warning:** `defineAuthContext` (authentication) and `defineAuthzContext` (authorization) are **independent** providers. Register both at app root when you need login verification AND role-based access control together.

```ts
import { defineAuthz } from '@ginjou/core'
import { defineAuthzContext } from '@ginjou/vue'

defineAuthzContext(defineAuthz({
	access: async (params) => {
		const userRole = await getCurrentUserRole()
		return { can: userRole === 'admin' }
	},
	getPermissions: async () => ['admin', 'editor'],
}))
```

## `useCanAccess`

`useCanAccess()` runs one action-level access check.

> ⚠️ **Warning:** The provider's `access` method must return `{ can: boolean, reason?: string }` — not a bare boolean. `useCanAccess` exposes it as `data.value?.can`.

```ts
import { useCanAccess } from '@ginjou/vue'

const { data } = useCanAccess({ resource: 'posts', action: 'edit', params: { id: '1' } })
```

The query resolves to `{ can: boolean, reason?: string }`. Use `data.value?.can` as the boolean indicating access permission.

## `usePermissions`

`usePermissions()` loads the broader permission snapshot — use it for a UI-wide view of what the user can do (e.g. building a nav menu). For a specific "can this user do X to this resource right now?" gate (per-button, per-route), use `useCanAccess` instead. The two are complementary, not interchangeable: `useCanAccess` answers one action check, `usePermissions` returns the whole snapshot.

```ts
import { usePermissions } from '@ginjou/vue'

const { data: permissions } = usePermissions<string[]>()
```

## Rules

- Keep policy logic in the authorization provider, not in feature components.
- Register `defineAuthzContext` unconditionally at the app root.
- Use action checks (`useCanAccess`) for resource-level decisions and permission snapshots (`usePermissions`) for broader UI policy.
- The authorization provider's `access` method must return `{ can: boolean, reason?: string }`; `useCanAccess` exposes this as `data.value?.can`. Return `reason` only when the UI can use it meaningfully.
- Keep authentication and authorization responsibilities separate; do not use authz hooks as a substitute for session or redirect handling.
