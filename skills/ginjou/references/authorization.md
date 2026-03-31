# Authorization Reference

Use this reference when the task includes access checks, permission loading, permission management, hiding or disabling actions by role, or action-level access control in a Ginjou app.

## Provider Rule

Authorization is separate from authentication. Register it with `defineAuthzContext` and keep business rules inside the authz provider instead of duplicating them in components.

## Main Composables

- `useCanAccess` — reactive access check for a specific action on a resource
- `usePermissions` — loads all permissions (for broader UI state like menus or role-driven layouts)

## Provider Contract

```typescript
import { defineAuthz } from '@ginjou/core'
import { defineAuthzContext } from '@ginjou/vue'

defineAuthzContext(defineAuthz({
  access: async (params) => {
    // params: { action, resource?, params?: { id?, ... }, meta? }
    // return { can: boolean, reason?: string }
    return { can: true }
  },
  getPermissions: async (params?) => {
    // return any permission structure your app uses
    return ['admin', 'editor']
  },
}))
```

## Composable Usage

```typescript
import { useCanAccess, usePermissions } from '@ginjou/vue'

// Action-level check (e.g., show/hide an edit button)
const { data } = useCanAccess({ resource: 'posts', action: 'edit', params: { id: '1' } })
// data.value?.can === true  → show the button

// Broader permission check (e.g., role-driven menu visibility)
const { data: permissions, isLoading } = usePermissions<string[]>()
// permissions.value → ['admin', 'editor']
```

## Guidance

- Return `{ can: boolean }` from `authz.access` as the base contract. `reason` is optional.
- Use `useCanAccess` for action-level checks such as edit, delete, or create buttons.
- Use `usePermissions` for broader UI states such as menu items, sections, or role-driven layout toggles.
- Keep ownership, role, and policy logic inside the provider — do not scatter it across components.
- Authz is **not** responsible for redirecting unauthenticated users; that is auth's responsibility.

## Nuxt SSR Variants

For Nuxt views that need server-hydrated permission state, use:

| Vue | Nuxt SSR |
| --- | --- |
| `useCanAccess` | `useAsyncCanAccess` |
| `usePermissions` | `useAsyncPermissions` |

## Common Mistakes

- Treating authz as part of auth instead of a separate provider.
- Repeating permission logic inside individual components instead of the provider.
- Using raw permissions where a focused `useCanAccess` check would be clearer.
- Registering `defineAuthzContext` conditionally instead of at the app root.

## Authority

- https://ginjou.pages.dev/guides/authorization
