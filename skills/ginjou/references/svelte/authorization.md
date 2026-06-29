# Svelte Authorization

Access-control wiring and composables for Svelte 5. **`defineAuthzContext`,
`useCanAccess`, `usePermissions` and the policy contract match Vue** — read
[vue/authorization.md](../vue/authorization.md) and
[core/authorization.md](../core/authorization.md). This file pins only the Svelte
syntax.

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

Read results off the returned object (no `.value`):

```svelte
<script lang="ts">
import { useCanAccess } from '@ginjou/svelte'

const edit = useCanAccess(() => ({ resource: 'posts', action: 'edit', params: { id } }))
</script>

{#if edit.data?.can}<button>Edit</button>{/if}
```

## Rules

- `access` must resolve to `{ can: boolean }`; `useCanAccess` exposes `data.can` (read off the object, not `data.value`).
- Use an accessor (`() => ({ … })`) when the checked `resource`/`action`/`params` are reactive.
- Don't use authz as a substitute for session/redirect handling. (Same as Vue/core.)
