# Vue Forms

Use this reference for Vue create and edit page controllers. See [Forms](https://ginjou.pages.dev/raw/guides/form.md) for page walkthroughs. See [behavior.md](./behavior.md) for redirect timing, local form state, and mutation-mode boundaries.

## `useCreate`

`useCreate()` is the page-controller API for create pages. `save()` accepts mutation data directly.

> ⚠️ **Warning:** `useCreate` is a **client-only** composable. It cannot run during SSR. In Nuxt, use `useAsync*` for server-side data loading and pair it with `useCreate` on the client.

```vue
<script setup lang="ts">
import type { Post, PostFormData } from './api/posts'
import { useCreate } from '@ginjou/vue'
import { reactive } from 'vue'

const { save } = useCreate<Post, PostFormData>({ resource: 'posts' })

const formData = reactive({ title: '', status: 'draft' })

async function handleSubmit() {
	await save(formData as PostFormData)
}
</script>
```

## `useCreate` Redirect

`useCreate()` can redirect automatically after a successful create.

```ts
useCreate({
	resource: 'posts',
	redirect: false,
})

useCreate({
	resource: 'posts',
	redirect: 'list',
})

useCreate({
	resource: 'posts',
	redirect: { action: 'list', params: { view: 'compact' } },
})
```

Common shapes are `false`, a resource-action string such as `'list'`, or a navigation object with `params`.

> ⚠️ **Warning:** `useCreate`'s built-in `redirect` does **not** preserve query/hash by default. If you need to keep the current query string or hash after redirect, use `useGo` or `useNavigateTo` with `keepQuery` / `keepHash` instead of the built-in redirect.

## `useEdit`

`useEdit()` combines record loading with page-level save behavior. Copy `record` into local reactive state before editing.

```vue
<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post, PostFormData } from './api/posts'
import { useEdit } from '@ginjou/vue'
import { reactive, watch } from 'vue'

const props = defineProps<{ mutationMode: MutationModeValues }>()

const { record, save } = useEdit<Post, PostFormData>({
	resource: 'posts',
	id: '1',
	mutationMode: props.mutationMode,
})

const formData = reactive({})

watch(record, (value) => {
	Object.assign(formData, value)
}, { immediate: true, deep: true })

async function handleSubmit() {
	await save(formData as PostFormData)
}
</script>
```

## Query Forwarding

`useEdit()` forwards `queryMeta` and `queryOptions` to its internal read query.

```ts
const post = useEdit({
	resource: 'posts',
	id: route.params.id,
	queryMeta: detailQueryMeta,
	queryOptions: {
		enabled: computed(() => route.params.id != null),
	},
})
```

`useCreate()` does not have a read query layer, so these props do not apply there.

## Rules

- Use `useCreate` for standard create pages and `useEdit` for standard edit pages.
- `useCreate` does not support `mutationMode`. Optimistic/pessimistic/undoable only applies to `useEdit`.
- Call `save()` with mutation data directly, not with a `params` wrapper.
- Copy `record` into local form state before editing.
- Use `queryMeta` and `queryOptions` on `useEdit` when the read side needs extra control.
- Keep non-page mutations on the lower-level data composables instead of forcing them into page controllers.
