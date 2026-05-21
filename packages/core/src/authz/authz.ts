import type { LiteralUnion } from 'type-fest'
import type { ResourceAction } from '../controller'
import type { RecordKey } from '../query'

export type GetPermissionsResult<
	TData,
> = TData | null

export type GetPermissionsFn<
	TData,
	TParams,
> = (
	params?: TParams,
) => Promise<GetPermissionsResult<TData>>

export interface AccessCanParams {
	action: LiteralUnion<ResourceAction.TypeValues, string>
	resource?: string
	params?: {
		id?: RecordKey
		[key: string]: any
	}
	meta?: Record<string, any>
}

export interface AccessCanResult {
	can: boolean
	reason?: string
}

export type AccessCanFn = (
	params: AccessCanParams,
) => AccessCanResult | Promise<AccessCanResult>

export interface Authz {
	access?: AccessCanFn
	getPermissions?: GetPermissionsFn<any, any>
}

/* @__NO_SIDE_EFFECTS__ */
export function defineAuthz<
	T extends Authz,
>(
	value: T,
): T {
	return value
}
