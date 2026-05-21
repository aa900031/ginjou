import type { LiteralUnion, ValueOf } from 'type-fest'
import type { Filters, Meta, Pagination, RecordKey, Sorters } from '../query'
import type { Context as ContextOption } from './options'

export const RealtimeMode = {
	Off: 'off',
	Auto: 'auto',
	Manual: 'manual',
} as const

export type RealtimeModeValue = ValueOf<typeof RealtimeMode>

export const RealtimeAction = {
	Any: '*',
	Deleted: 'deleted',
	Updated: 'updated',
	Created: 'created',
} as const

export type RealtimeActionValues = LiteralUnion<ValueOf<typeof RealtimeAction>, string>

export const SubscribeType = {
	List: 'list',
	One: 'one',
	Many: 'many',
} as const

export type SubscribeTypeValues = ValueOf<typeof SubscribeType>

export interface SubscribeListParams<
	TPageParam,
> {
	type: typeof SubscribeType.List
	resource: string
	pagination?: Pagination<TPageParam>
	sorters?: Sorters
	filters?: Filters
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

export interface RealtimeEvent<
	TPayload = unknown,
> {
	channel: string
	action: RealtimeActionValues
	payload: TPayload // TODO: 釐清使用方式
	date: Date
	meta?: Meta
}

export type SubscribeCallbackFn<
	TPayload,
> = (
	event: RealtimeEvent<TPayload>,
) => void

export interface SubscribeProps<
	TPayload,
	TPageParam,
> {
	channel: string
	actions: RealtimeActionValues[]
	callback: SubscribeCallbackFn<TPayload>
	params?:
		| SubscribeListParams<TPageParam>
		| SubscribeOneParams
		| SubscribeManyParams
		| Record<string, any>
	meta?: Meta
}

export type SubscribeFn<
	TPayload,
	TPageParam,
> = (
	props: SubscribeProps<TPayload, TPageParam>,
) => UnsubscribeKey

export type UnsubscribeKey = string

export type UnsubscribeProps
	= | UnsubscribeKey

export type UnsubscribeFn = (
	props: UnsubscribeProps,
) => void

export type PublishFn<
	TPayload,
> = (
	event: RealtimeEvent<TPayload>,
) => void

export interface Realtime {
	subscribe: SubscribeFn<any, any>
	unsubscribe?: UnsubscribeFn
	publish?: PublishFn<any>
	options?: ContextOption<any>
}

/* @__NO_SIDE_EFFECTS__ */
export function defineRealtime<
	T extends Realtime,
>(
	value: T,
): T {
	return value
}
