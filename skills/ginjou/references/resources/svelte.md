# Svelte Resources

Resource registration and helpers for Svelte 5. **`defineControllerContext`,
`useResource`, `useResourcePath`, the definition shape, and nested/multi-backend
metadata match Vue** — read [vue.md](./vue.md) and
[behavior.md](./behavior.md). This file pins only the Svelte syntax.

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
route inference also requires `defineRouterContext` (see [router/svelte.md](../router/svelte.md)).

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
