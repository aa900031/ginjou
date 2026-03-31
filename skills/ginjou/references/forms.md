# Forms Reference

Use this reference when the task is about create forms, edit forms, save flows, or delete actions, especially when page behavior includes navigation after mutation.

## Use Form Controllers Only For Clear CRUD Forms

Use page-level controllers only when the form flow is clearly a conventional CRUD page:

- `useCreate` for create pages
- `useEdit` for edit pages
- `useDeleteOne` for destructive actions attached to UI controls

If the task involves custom orchestration, unusual navigation, embedded workflows, or unclear requirements, ask the user before defaulting to form controllers and consider lower-level mutations instead.

## Key Shapes

```typescript
// mutation mode string literals
// 'pessimistic' (default) | 'optimistic' | 'undoable'

// useCreate — exposes save(), NOT mutateAsync
const { save, isPending } = useCreate({ resource: 'posts', mutationMode: 'pessimistic' })
await save({ title: 'Hello' }) // pass mutation data directly, no params wrapper

// useEdit — id resolved from route when resource routing is active;
// otherwise read from route.params and pass explicitly:
const route = useRoute()
const id = toRef(() => route.params.id as string)
const { record, save, isPending } = useEdit({ resource: 'posts', id })
// record.value contains the fetched data for form initialization
// initialize local form data from record, but do NOT bind inputs directly to record
await save({ title: 'Updated' }) // pass mutation data directly, no params wrapper

// useDeleteOne (from data composables, not a separate controller)
const { mutateAsync: deleteOne } = useDeleteOne()
await deleteOne({ resource: 'posts', id: '1' })
```

## `useCreate`

Use `useCreate` when the page should create a record and then transition to the next screen.

- It composes `useCreateOne` and navigation helpers.
- It is the right default for create pages.
- Choose the mutation mode deliberately.

### Mutation Modes

- `pessimistic` (default): navigate after the request succeeds
- `optimistic`: navigate immediately before the request completes
- `undoable`: delay the mutation and expose undo through notifications

Use `pessimistic` unless the user or product flow explicitly requires a faster or reversible experience. Use `undoable` only when a notification provider exists.

## `useEdit`

Use `useEdit` when the page needs both the existing record and the update mutation.

- It composes `useGetOne` and `useUpdateOne`.
- It exposes `record`, `save()`, `isPending`, and `isLoading`.
- It fits route-driven edit pages well.

**Form initialization pattern:** Watch `record` to copy values into a local reactive form state. Do **not** bind form inputs directly to `record` or any other TanStack Query cache ref — doing so creates two-way coupling where typing in the form mutates the cache, causing the form to reset or flicker whenever the query refetches in the background.

```typescript
const { record, save } = useEdit({ resource: 'posts', id })
const formData = reactive({})
watch(record, (val) => { Object.assign(formData, val) }, { immediate: true, deep: true })
```

## `useDeleteOne`

Use `useDeleteOne` for destructive actions, but always pair it with explicit user confirmation.

- Show a modal or confirmation step first.
- Execute the mutation only after confirmation.
- Rely on the built-in cache invalidation and notification behavior.

`useDeleteOne` is a data composable, not a controller. Its `resource` and `id` can be passed either at setup time or at call time:

```typescript
// Option A — pass args at call time (typical for list-row delete buttons)
const { mutateAsync: del } = useDeleteOne()
await del({ resource: 'posts', id: record.id, mutationMode: 'pessimistic' })

// Option B — pass resource/id at setup time (when only one record will be deleted)
const { mutateAsync: del } = useDeleteOne({ resource: 'posts', id: '1' })
await del({}) // only override or extra params needed at call time
```

## Nuxt Guidance

- Use `useAsyncEdit` when the edit screen should SSR the initial record.
- `useCreate` remains a normal mutation-first controller because there is no initial query to hydrate.
- `useAsyncCreate` does not exist; verify async export names in `packages/nuxt/src/imports/async.ts` if unsure.

## Common Mistakes

- Assuming every form should use `useCreate` or `useEdit` before confirming it is a standard CRUD flow.
- Using low-level mutations for a standard create or edit page without any need for custom control.
- **Binding form inputs directly to `record` or cached query data** — always copy into local reactive state first.
- Forgetting that `undoable` depends on a notification provider.
- Using `useAsyncCreate` — it does not exist.
- Triggering `useDeleteOne` without a confirmation step.

## Authority

- https://ginjou.pages.dev/guides/form
- https://ginjou.pages.dev/guides/notifications
- https://ginjou.pages.dev/integrations/nuxt
