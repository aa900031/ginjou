# Svelte Forms

Create/edit page controllers for Svelte 5. **`useCreate` / `useEdit` names,
options, redirect shapes, and mutation-mode rules match Vue** — read
[vue.md](./vue.md) and [behavior.md](./behavior.md).
This file pins only the Svelte syntax. See [../setup/svelte.md](../setup/svelte.md) for runes.

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

## Unsaved Changes Guard — accessors, not refs

Props, defaults, precedence, and path-comparison limits are identical to Vue —
see [behavior.md](./behavior.md) and [vue.md](./vue.md). The only Svelte difference
is the shape: `warnUnsavedActive` is a `boolean` get/set accessor and
`useWarnUnsaved` returns `{ active: boolean, readonly state: WarnUnsaved.StateValues }`
— **no `.value`**. There is no call-timing restriction in Svelte, unlike Vue.

```svelte
<script lang="ts">
import { useEdit } from '@ginjou/svelte'

const { id } = $props()
const edit = useEdit<Post, PostFormData>(() => ({ resource: 'posts', id, warnUnsaved: true }))

const form = $state({ title: '', body: '' })
$effect(() => {
	// Sync only. Do not reset `warnUnsavedActive` here — `record` re-emits on refetch
	// and would drop the guard mid-edit. `save()` clears it on success.
	if (edit.record) { form.title = edit.record.title; form.body = edit.record.body }
})

function onInput() {
	edit.warnUnsavedActive = true
}

async function submit() {
	await edit.save(form)
}
</script>
```

```svelte
import { WarnUnsaved } from '@ginjou/core'
import { useWarnUnsaved } from '@ginjou/svelte'

const warn = useWarnUnsaved({
	enabled: true,
	confirm: async () => await openDiscardDialog(),
})

warn.active = true

const asking = $derived(warn.state === WarnUnsaved.State.Confirming)
```

> ⚠️ **Warning:** Do **not** destructure the result. `const { active } = useWarnUnsaved(…)` loses both the getter's reactivity and the setter. Keep the object and use `warn.active` / `edit.warnUnsavedActive`.

## Rules

- `useCreate` has no `mutationMode`; optimistic/undoable/pessimistic is `useEdit` only (same as Vue).
- Keep form data in `$state`; sync the loaded record with `$effect`, not `watch`/`Object.assign`.
- Pass an accessor (`() => ({ … })`) when `id` comes from reactive props/route.
- Redirect options (`false` / `'list'` / `{ action, params }`) and the query/hash caveat are identical to Vue — see vue.md.
- Assign `edit.warnUnsavedActive` / `warn.active` directly (no `.value`) when the form is dirty; do not reset it after `save()`.
- Never destructure `useWarnUnsaved` or `warnUnsavedActive` off the controller.
