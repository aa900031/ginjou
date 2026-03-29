# Forms Reference

Use this reference when the task is about create, edit, or delete flows, especially when page behavior includes navigation after mutation.

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
const { save, isLoading } = useCreate({ resource: 'posts', mutationMode: 'pessimistic' })
await save({ title: 'Hello' }) // pass mutation data directly, no params wrapper

// useEdit — id resolved from route; record available for form initialization
const { record, save, isLoading } = useEdit({ resource: 'posts' })
// initialize form from record.value, but do NOT bind inputs directly to record
await save({ title: 'Updated' }) // pass mutation data directly, no params wrapper

// useDeleteOne (from data composables, not a controller)
const { mutateAsync: deleteOne } = useDeleteOne()
await deleteOne({ resource: 'posts', id: '1' })
```

## `useCreate`

Use `useCreate` when the page should create a record and then transition to the next screen.

- It composes `useCreateOne` and navigation helpers.
- It is the right default for create pages.
- Choose the mutation mode deliberately.

### Mutation Modes

- `pessimistic`: safest default, navigate after success
- `optimistic`: navigate immediately while the request continues
- `undoable`: delay the mutation and expose undo through notifications

Use `pessimistic` unless the user or product flow explicitly requires a faster or reversible experience. Use `undoable` only when a notification provider exists.

## `useEdit`

Use `useEdit` when the page needs both the existing record and the update mutation.

- It composes `useGetOne` and `useUpdateOne`.
- It exposes a combined loading state.
- It fits route-driven edit pages well.

Keep fetched server state separate from local form state. Initialize form data from `record`, but do not bind inputs directly to the query result. Direct binding creates two-way coupling where typing in the form mutates the TanStack Query cache, causing the form to reset or flicker whenever the query refetches in the background.

## `useDeleteOne`

Use `useDeleteOne` for destructive actions, but always pair it with explicit user confirmation.

- show a modal or confirmation step first
- execute the mutation only after confirmation
- rely on the built-in cache invalidation and notification behavior

## Nuxt Guidance

- Use `useAsyncEdit` when the edit screen should SSR the initial record.
- `useCreate` remains a normal mutation-first controller because there is no initial query to hydrate.

## Common Mistakes

- Assuming every form should use `useCreate` or `useEdit` before confirming it is a standard CRUD flow.
- Using low-level mutations for a standard create or edit page without any need for custom control.
- Binding form inputs directly to cached query data.
- Forgetting that `undoable` depends on notifications.
- Triggering `useDeleteOne` without a confirmation flow.

## Authority

- https://ginjou.pages.dev/guides/form
- https://ginjou.pages.dev/guides/notifications
- https://ginjou.pages.dev/integrations/nuxt
