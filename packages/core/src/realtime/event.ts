import type { LiteralUnion, ValueOf } from 'type-fest'
import type { Meta } from '../query'

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
	meta?: Meta
}
