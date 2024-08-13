import type { LiteralUnion, ValueOf } from 'type-fest'
import type { SubscribeFn } from './subscribe'
import type { UnsubscribeFn } from './unsubscribe'
import type { PublishFn } from './publish'

export const RealtimeAction = {
	Any: '*',
	Deleted: 'deleted',
	Updated: 'updated',
	Created: 'created',
} as const

export type RealtimeActionValues = LiteralUnion<ValueOf<typeof RealtimeAction>, string>

export interface RealtimeEvent<
	TPayload = unknown,
> {
	channel: string
	action: RealtimeActionValues
	payload: TPayload // TODO: 釐清使用方式
	date: Date
}

export interface Realtime {
	subscribe: SubscribeFn
	unsubscribe?: UnsubscribeFn
	publish?: PublishFn
}
