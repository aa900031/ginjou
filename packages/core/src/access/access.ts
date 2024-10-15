import type { LiteralUnion } from 'type-fest'
import type { ResourceActionTypeValues } from '../resource'
import type { RecordKey } from '../query'

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

export interface Access {
	can: AccessCanFn
}
