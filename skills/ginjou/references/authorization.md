# Authorization Reference

Use this reference for permission checks, access control, and role-based UI visibility.

## Concept

Ginjou authorization is separate from authentication. It answers the question: "Can the current user perform this action?" Register an authz provider with `defineAuthzContext` and use `useCanAccess` or `usePermissions` in components.

## Provider Setup

```typescript
import { defineAuthz } from '@ginjou/core'
import { defineAuthzContext } from '@ginjou/vue'

defineAuthzContext(defineAuthz({
  access: async (params) => {
    // params: { action, resource?, params?: { id?, ... }, meta? }
    // Return { can: boolean, reason?: string }
    const userRole = await getCurrentUserRole()
    return { can: userRole === 'admin' }
  },
  getPermissions: async () => {
    // Return any permission structure your app uses
    return ['admin', 'editor']
  },
}))
```

## Composable Usage

```vue
<!-- From stories/vue/src/AuthPermissions.vue -->
<script setup lang="ts">
import { usePermissions } from '@ginjou/vue'

const { data: permissions, isLoading } = usePermissions<string[]>()
</script>

<template>
  <template v-if="isLoading || permissions == null">Loading…</template>
  <template v-else>
    Permissions: {{ permissions }}
  </template>
</template>
```

```typescript
// Action-level check — e.g. show/hide an edit button
import { useCanAccess } from '@ginjou/vue'

const { data } = useCanAccess({
  resource: 'posts',
  action: 'edit',
  params: { id: '1' },
})
// data.value?.can === true  →  show the button
```

## Composable Reference

| Composable | Use for |
| --- | --- |
| `useCanAccess` | Single action check — edit/delete/create button visibility |
| `usePermissions` | Broad permission loading — role-driven menus, layout sections |

## Nuxt SSR Variants

| Vue | Nuxt SSR |
| --- | --- |
| `useCanAccess` | `useAsyncCanAccess` |
| `usePermissions` | `useAsyncPermissions` |

## Rules

- Use `useCanAccess` for action-level checks. Use `usePermissions` for broader role-driven UI.
- Keep ownership and policy logic inside the provider — do not spread it across components.
- Authorization does not redirect unauthenticated users — that is auth's job.
- Register `defineAuthzContext` unconditionally at the app root.

## Further Reading

- https://ginjou.pages.dev/guides/authorization
