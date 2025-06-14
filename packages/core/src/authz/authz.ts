import type { LiteralUnion } from 'type-fest'
import type { RecordKey } from '../query'
import type { ResourceActionTypeValues } from '../resource'

export type GetPermissionsFn =
	(params?: any) => Promise<unknown>

export interface AccessCanParams {
	action: LiteralUnion<ResourceActionTypeValues, string>
	resource?: string
	params?: {
		id?: RecordKey
	}
	meta?: Record<string, any>
}

export interface AccessCanResult {
	can: boolean
	reason?: string
}

export type AccessCanFn = (params: AccessCanParams) => AccessCanResult

export interface Authz {
	access?: AccessCanFn
	getPermissions?: GetPermissionsFn
}
