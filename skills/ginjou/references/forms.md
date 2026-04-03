# Forms Reference

Use this reference for create forms, edit forms, and delete actions where the goal is standard CRUD with navigation after save.

## Concept

`useCreate` and `useEdit` are controller-level composables that combine data mutations with navigation. They return a `save()` function instead of `mutateAsync`. Use them for standard page-level CRUD. For embedded dialogs, widgets, or non-page mutations, see [data-composables.md](./data-composables.md).

## `useCreate` — Create Form

`save()` accepts mutation data directly. No `params` wrapper needed.

```vue
<!-- From stories/vue/src/FormCreate.vue -->
<script setup lang="ts">
import type { Post, PostFormData } from './api/posts'
import { useCreate } from '@ginjou/vue'
import { reactive, shallowRef, toRef } from 'vue'

const props = defineProps<{ redirect?: any }>()

const { save } = useCreate<Post, PostFormData>({
  resource: 'posts',
  redirect: toRef(props, 'redirect'),
})

const formData = reactive({ title: '', status: 'draft' })
const result = shallowRef<Post>()

async function handleSubmit() {
  const resp = await save(formData as PostFormData)
  result.value = resp.data
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.title" type="text" placeholder="Title">
    <button type="submit">Submit</button>
  </form>
</template>
```

## `useEdit` — Edit Form

Returns `record` (fetched data) and `save()`. Always copy `record` into a local reactive state — do **not** bind form inputs directly to `record`.

```vue
<!-- From stories/vue/src/FormEdit.vue -->
<script setup lang="ts">
import type { MutationModeValues } from '@ginjou/core'
import type { Post, PostFormData } from './api/posts'
import { useEdit } from '@ginjou/vue'
import { reactive, toRef, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{ mutationMode: MutationModeValues; redirect?: any }>()
const route = useRoute()

const { record, save } = useEdit<Post, PostFormData>({
  resource: 'posts',
  id: toRef(() => route.params.id as string),
  mutationMode: toRef(props, 'mutationMode'),
  redirect: toRef(props, 'redirect'),
})

// Copy into local state — never bind inputs to record directly
const formData = reactive({})
watch(record, (val) => {
  Object.assign(formData, val)
}, { immediate: true, deep: true })

async function handleSubmit() {
  await save(formData as PostFormData)
}
</script>
```

## `useDeleteOne` — Delete Action

`useDeleteOne` is a mutation composable (not a controller). Pass `resource` and `id` either at setup time or at call time. Always confirm before executing.

```vue
<!-- From stories/vue/src/DeleteOne.vue -->
<script setup lang="ts">
import type { Post } from './api/posts'
import { useDeleteOne, useList } from '@ginjou/vue'

const { records } = useList<Post>({ resource: 'posts' })
const { mutateAsync: del } = useDeleteOne()

async function handleDeleteClick(record: Post) {
  // Always confirm first
  if (!confirm(`Delete "${record.title}"?`)) return
  await del({
    id: record.id,
    resource: 'posts',
    mutationMode: 'pessimistic',
  })
}
</script>
```

### Call-time vs setup-time args

```typescript
// Option A — pass args at call time (typical for list-row delete buttons)
const { mutateAsync: del } = useDeleteOne()
await del({ resource: 'posts', id: record.id })

// Option B — pass resource/id at setup time (when target is fixed)
const { mutateAsync: del } = useDeleteOne({ resource: 'posts', id: '1' })
await del({})
```

## Mutation Modes

All form controllers accept `mutationMode`:

- `'pessimistic'` (default): navigate after the server responds
- `'optimistic'`: navigate immediately, revert on server error
- `'undoable'`: delay the mutation with an undo window — requires a notification provider

## Rules

- Use `useCreate` / `useEdit` for standard CRUD pages; use `useCreateOne` / `useUpdateOne` for non-page mutations.
- Always initialize edit form state from `record` using `watch` — never bind inputs to `record` directly.
- Confirm before calling `useDeleteOne`.
- `undoable` mode requires `defineNotificationContext` to be registered.
- `useAsyncCreate` does not exist in Nuxt — use `useCreate` directly.

## Further Reading

- https://ginjou.pages.dev/guides/form
