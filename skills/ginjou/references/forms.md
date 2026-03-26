# Forms Reference

Use this reference when the task is about create, edit, or delete flows, especially when page behavior includes navigation after mutation.

## Start With Controllers For Forms

Use page-level controllers first:

- `useCreate` for create pages
- `useEdit` for edit pages
- `useDeleteOne` for destructive actions attached to UI controls

These cover the common form flow better than assembling everything from low-level mutations by hand.

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

Keep fetched server state separate from local form state. Initialize form data from `record`, but do not bind inputs directly to the query result.

## `useDeleteOne`

Use `useDeleteOne` for destructive actions, but always pair it with explicit user confirmation.

- show a modal or confirmation step first
- execute the mutation only after confirmation
- rely on the built-in cache invalidation and notification behavior

## Nuxt Guidance

- Use `useAsyncEdit` when the edit screen should SSR the initial record.
- `useCreate` remains a normal mutation-first controller because there is no initial query to hydrate.

## Common Mistakes

- Using low-level mutations for a standard create or edit page without any need for custom control.
- Binding form inputs directly to cached query data.
- Forgetting that `undoable` depends on notifications.
- Triggering `useDeleteOne` without a confirmation flow.

## Authority

- `docs/content/1.guides/2.form.md`
- `docs/content/1.guides/6.notifications.md`
- `docs/content/2.integrations/1.nuxt.md`
- `packages/vue/src/controller/create.ts`
- `packages/vue/src/controller/edit.ts`
- `packages/vue/src/query/delete.ts`
