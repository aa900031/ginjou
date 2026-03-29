# Authorization Reference

Use this reference when the task includes access checks, permission loading, or action-level UI gating in a Ginjou app.

## Provider Rule

Authorization is separate from authentication. Register it with `defineAuthzContext` and keep business rules inside the authz provider instead of duplicating them in components.

## Main Composables

- `useCanAccess`
- `usePermissions`

## Provider Contract

```typescript
interface Authz {
	access?: (params: AccessCanParams) => AccessCanResult | Promise<AccessCanResult>
	getPermissions?: (params?: any) => Promise<any>
}

interface AccessCanParams {
	action: string // 'list' | 'create' | 'edit' | 'delete' | 'show' | any custom string
	resource?: string
	params?: { id?: string | number, [key: string]: any }
	meta?: Record<string, any>
}

interface AccessCanResult { can: boolean, reason?: string }
```

## Composable Usage

```typescript
const { data } = useCanAccess({ resource: 'posts', action: 'edit', params: { id: '1' } })
// data.value: AccessCanResult — check data.value?.can === true before showing edit UI

const { data: permissions, isLoading } = usePermissions()
```

## Guidance

- Return `{ can: boolean }` from `authz.access` as the base contract.
- Use `useCanAccess` for action-level checks such as edit or delete buttons.
- Use `usePermissions` for broader UI states such as menus, sections, or role-driven layouts.
- Keep ownership, role, and policy checks inside the provider.

## Common Mistakes

- Treating authz as part of auth instead of a separate provider.
- Repeating permission logic inside individual components.
- Using raw permissions where an action-level `useCanAccess` check would be clearer.

## Authority

- https://ginjou.pages.dev/guides/authorization
