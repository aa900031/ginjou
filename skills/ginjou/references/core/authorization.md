# Core Authorization

## Authorization Contract

```ts
interface Authz {
	access?: AccessCanFn
	getPermissions?: GetPermissionsFn<any, any>
}
```

`access` answers whether one action is allowed. `getPermissions` returns any broader permission structure the app wants to expose, such as roles, grants, or capability lists.

## Access-Check Model

The action-check contract accepts:

- `action`
- optional `resource`
- optional `params`, including `id`
- optional `meta`

It returns `{ can: boolean, reason?: string }`.

Use this model for action-level decisions such as whether the current user may edit, delete, create, or view a specific resource.

## Permission Snapshot Model

Use permission snapshots for broader UI decisions such as menus, layouts, or role-driven sections.

## Boundary With Authentication

See [Authorization](docs/content/1.guides/5.authorization.md) and [Authentication](docs/content/1.guides/4.authentication.md) for the contract boundary.

Do not use authorization to handle session expiry or login redirects. That stays in the auth layer.

## Rules

- Keep policy logic in the authorization provider, not in feature components.
- Use action checks for resource-level decisions and permission snapshots for broader UI policy.
- Keep authentication and authorization responsibilities separate.
- Return `reason` only when the UI can use it meaningfully.
