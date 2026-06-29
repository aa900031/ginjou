# Svelte Resources

Resource registration and helpers for Svelte 5. **`defineControllerContext`,
`useResource`, `useResourcePath`, the definition shape, and nested/multi-backend
metadata match Vue** — read [vue/resources.md](../vue/resources.md) and
[core/resources.md](../core/resources.md). This file pins only the Svelte syntax.

```svelte
<script lang="ts">
import { defineControllerContext } from '@ginjou/svelte'

defineControllerContext({
  resources: [
    { name: 'posts', list: '/posts', create: '/posts/new', show: '/posts/:id', edit: '/posts/:id/edit' },
  ],
})
</script>
```

`useResource()` resolves a definition from a name or the current route, and
`useResourcePath()` builds one action path. Both require `defineControllerContext`;
route inference also requires `defineRouterContext` (see [svelte/router.md](./router.md)).

```svelte
<script lang="ts">
import { ResourceAction } from '@ginjou/core'
import { useResourcePath } from '@ginjou/svelte'

const createPath = useResourcePath({ action: ResourceAction.Type.Create, resource: 'posts' })
</script>
```

## Rules

- Register `defineControllerContext` once at app setup.
- `useResource()` route inference needs `defineRouterContext` too; otherwise pass the resource name explicitly.
- An unresolvable resource/action path yields `undefined`. (Same as Vue/core.)
