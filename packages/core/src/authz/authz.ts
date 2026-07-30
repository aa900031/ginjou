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

export interface CanAccessParams {
	action: LiteralUnion<ResourceAction.TypeValues, string>
	resource?: string
	params?: {
		id?: RecordKey
		[key: string]: any
	}
	meta?: Record<string, any>
}

export interface CanAccessResult {
	can: boolean
	reason?: string
}

export type CanAccessFn = (
	params: CanAccessParams,
) => CanAccessResult | Promise<CanAccessResult>

/** @deprecated Use `CanAccessParams` instead. */
export type AccessCanParams = CanAccessParams

/** @deprecated Use `CanAccessResult` instead. */
export type AccessCanResult = CanAccessResult

/** @deprecated Use `CanAccessFn` instead. */
export type AccessCanFn = CanAccessFn

export interface Authz {
	access?: CanAccessFn
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
