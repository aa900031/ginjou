# Vue Authorization

Use this reference for Vue authz wiring and authz composables. See [Authorization](docs/content/1.guides/5.authorization.md) for guide-level usage. See [core/authorization.md](../core/authorization.md) for contract and policy boundaries.

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

> ⚠️ **Warning:** The `canAccess` method in your authorization provider must return a **boolean** value. `useCanAccess` exposes the result as `{ can: boolean }`.

```ts
import { useCanAccess } from '@ginjou/vue'

const { data } = useCanAccess({ resource: 'posts', action: 'edit', params: { id: '1' } })
```

The query resolves to `{ can: boolean, reason?: string }`. Use `data.value?.can` as the boolean indicating access permission.

## `usePermissions`

`usePermissions()` loads the broader permission snapshot.

```ts
import { usePermissions } from '@ginjou/vue'

const { data: permissions } = usePermissions<string[]>()
```

## Rules

- Register `defineAuthzContext` unconditionally at the app root.
- Use `useCanAccess` for one action check and `usePermissions` for broader permission loading.
- Keep policy decisions inside the provider instead of duplicating them across components.
- The authorization provider's `access` method must return `{ can: boolean }`. `useCanAccess` exposes this result directly.
- Do not use authz hooks as a substitute for session or redirect handling.
