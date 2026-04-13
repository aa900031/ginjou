# Topic Registry

This registry defines the long-lived topic taxonomy for skill regression tests.

## Usage Rules

- Add a topic here before adding a new eval case that depends on it.
- Keep each topic name stable once it is used in a frozen snapshot.
- If a prompt fits two topics, split the prompt into two separate evals instead of forcing one label.
- Update the registry when a topic needs a new scoring rule or a new expected behavior.

## Topic Table

| Topic ID | Scope | Typical Prompt Shape | Required Checks | Notes |
| --- | --- | --- | --- | --- |
| list.filters | Standard list page with filters or pagination | "Show a list page with filters and pagination" | useList, pagination/filter contract, backend safety | Use for normal table/list pages. |
| list.sorter | Standard list page with sorting | "Add sortable columns to a list" | useList, sort contract, backend safety | Keep separate from filters when the scoring differs. |
| list.infinite | Infinite scroll or endless loading list | "Load more as I scroll" | infinite loading pattern, backend pagination behavior | Use when pagination is not page-based. |
| create.edit | Create or edit page / form | "Add a create or edit page" | useCreate/useEdit, save flow, mutation mode | Keep page CRUD separate from row actions. |
| delete.confirmation | Delete action with confirmation | "Delete a record with a confirmation dialog" | useDeleteOne, confirm flow, rollback or pessimistic mode | Use for row actions and modals. |
| search.select | Remote search or autocomplete field | "Build a user search field" | useSelect, selected value persistence, backend query contract | Selected value must not be tied to the latest result set. |
| row.action | Row-level action that is not a full page | "Delete or edit from a row action" | data-composables, surface clarity, backend safety | Use for row buttons, drawers, and inline side panels. |
| route.setup | App root setup or route-aware wiring | "Where should providers live?" | App.vue or app.vue, resource inference, setup boundary | Use when provider placement matters. |
| backend.rest | REST-specific behavior | "Custom headers or REST query params" | REST contract, methods, headers, fallback behavior | Keep REST checks explicit. |
| backend.supabase | Supabase-specific behavior | "Use Supabase with select/count/id mapping" | meta.select, meta.count, idColumnName, auth/mutation safety | Use for select and mutation contracts. |
| backend.directus | Directus-specific behavior | "Use Directus fields or aggregate" | meta.query.fields, meta.query.filter, aggregate/groupBy | Keep aggregate and groupBy separate when needed. |
| notification.undoable | Undoable mutations and feedback wiring | "Make this undoable" | notification provider, undo flow, fallback mode | Ask for notification wiring if missing. |
| realtime.refresh | Realtime or fallback refresh behavior | "Auto-refresh when data changes" | transport availability, polling fallback, manual refresh | Never assume push transport exists. |

## Adding a New Topic

When a new prompt type appears:

1. Decide whether it is a new topic or a refinement of an existing one.
2. Write one short prompt template.
3. List the required checks that determine a pass.
4. Add notes about what would make the prompt ambiguous.
5. Add the eval to the next iteration snapshot.

## Snapshot Rule

Each iteration snapshot must use the exact topic IDs in this registry so older runs remain comparable.
