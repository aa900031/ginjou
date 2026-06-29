# Svelte Forms

Create/edit page controllers for Svelte 5. **`useCreate` / `useEdit` names,
options, redirect shapes, and mutation-mode rules match Vue** — read
[vue/forms.md](../vue/forms.md) and [core/mutation-flows.md](../core/mutation-flows.md).
This file pins only the Svelte syntax. See [svelte/setup.md](./setup.md) for runes.

## `useCreate`

```svelte
<script lang="ts">
import { useCreate } from '@ginjou/svelte'

const create = useCreate<Post, PostFormData>({ resource: 'posts', redirect: 'list' })
const form = $state({ title: '', body: '' })

async function submit() {
  await create.save(form)
}
</script>

<form onsubmit={(e) => { e.preventDefault(); submit() }}>
  <input bind:value={form.title} />
  <textarea bind:value={form.body}></textarea>
  <button type="submit">Save</button>
</form>
```

## `useEdit` — copy record into local state with `$effect`

The Vue reference does this with `watch` + `Object.assign`. In Svelte, use
`$state` for the form and a `$effect` that copies the loaded `record` in — **do
not port the Vue `reactive`/`watch` idiom**.

```svelte
<script lang="ts">
import { useEdit } from '@ginjou/svelte'

const { id } = $props()
const edit = useEdit<Post, PostFormData>(() => ({ resource: 'posts', id, redirect: 'list' }))

const form = $state({ title: '', body: '' })
$effect(() => {
  if (edit.record) { form.title = edit.record.title; form.body = edit.record.body }
})

async function submit() {
  await edit.save(form)
}
</script>
```

## Rules

- `useCreate` has no `mutationMode`; optimistic/undoable/pessimistic is `useEdit` only (same as Vue).
- Keep form data in `$state`; sync the loaded record with `$effect`, not `watch`/`Object.assign`.
- Pass an accessor (`() => ({ … })`) when `id` comes from reactive props/route.
- Redirect options (`false` / `'list'` / `{ action, params }`) and the query/hash caveat are identical to Vue — see vue/forms.md.
