import type { ValueOf } from 'type-fest'
import type { Filter, Meta, Pagination, RecordKey, Sorters } from '../query'

import type { RealtimeActionValues, RealtimeEvent } from './event'

export const SubscribeType = {
	List: 'list',
	One: 'one',
	Many: 'many',
} as const

export type SubscribeTypeValues = ValueOf<typeof SubscribeType>

export interface SubscribeListParams {
	type: typeof SubscribeType.List
	resource: string
	pagination?: Pagination<any>
	sorters?: Sorters
	filters?: Filter
	meta?: Meta
}

export interface SubscribeOneParams {
	type: typeof SubscribeType.One
	resource: string
	id: RecordKey
	meta?: Meta
}

export interface SubscribeManyParams {
	type: typeof SubscribeType.Many
	resource: string
	ids: RecordKey[]
	meta?: Meta
}

export type SubscribeCallbackFn<
	TPayload,
> = (
	event: RealtimeEvent<TPayload>
) => void

export interface SubscribeProps<
	TPayload,
> {
	channel: string
	actions: RealtimeActionValues[]
	callback: SubscribeCallbackFn<TPayload>
	params?:
		| SubscribeListParams
		| SubscribeOneParams
		| SubscribeManyParams
	meta?: Meta
}

export type SubscribeFn = <
	TPayload,
>(
	props: SubscribeProps<TPayload>,
) => UnsubscribeKey

export type UnsubscribeKey = string

export type UnsubscribeProps =
	| UnsubscribeKey

export type UnsubscribeFn = (
	props: UnsubscribeProps,
) => void

export type PublishFn = <
	TPayload,
>(
	event: RealtimeEvent<TPayload>
) => void

export interface Realtime {
	subscribe: SubscribeFn
	unsubscribe?: UnsubscribeFn
	publish?: PublishFn
}
