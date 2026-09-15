import type { Filters, RealtimeActionValues, RecordKey, SubscribeListParams, SubscribeManyParams, SubscribeOneParams, SubscribeProps } from '@ginjou/core'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { defineRealtime, isLogicalFilter, RealtimeAction, SubscribeType } from '@ginjou/core'

export interface CreateRealtimeProps {
	client: SupabaseClient
}

export interface RealtimeMeta {
	schema?: string
	idColumnName?: string
}

export interface RealtimePayload<
	TRecord = Record<string, any>,
> {
	ids: RecordKey[] | undefined
	data: TRecord
}

type PostgresEvent = 'INSERT' | 'UPDATE' | 'DELETE'

type Params = SubscribeOneParams | SubscribeManyParams | SubscribeListParams<any>

interface PostgresChangesPayload {
	eventType: PostgresEvent
	new: Record<string, any>
	old: Record<string, any>
	commit_timestamp: string
}

const ACTION_TO_EVENT: Record<string, PostgresEvent | '*'> = {
	[RealtimeAction.Created]: 'INSERT',
	[RealtimeAction.Updated]: 'UPDATE',
	[RealtimeAction.Deleted]: 'DELETE',
	[RealtimeAction.Any]: '*',
}

const EVENT_TO_ACTION: Record<PostgresEvent, RealtimeActionValues> = {
	INSERT: RealtimeAction.Created,
	UPDATE: RealtimeAction.Updated,
	DELETE: RealtimeAction.Deleted,
}

// eslint-disable-next-line ts/explicit-function-return-type
export function createRealtime(
	{
		client,
	}: CreateRealtimeProps,
) {
	const channels = new Map<string, RealtimeChannel>()
	let seq = 0

	return defineRealtime({
		subscribe: ({ channel, actions, callback, params, meta }: SubscribeProps<RealtimePayload, any>) => {
			const table = channel.replace(/^resources\//, '')
			const idColumn = (meta as RealtimeMeta)?.idColumnName ?? 'id'
			const ids = getIds(params)
			const filter = getFilter(params, idColumn)
			const events = getEvents(actions)
			const key = `${channel}:${++seq}`

			let realtimeChannel = client.channel(key)
			for (const event of events) {
				realtimeChannel = realtimeChannel.on(
					'postgres_changes',
					{
						event: event as any,
						schema: (meta as RealtimeMeta)?.schema ?? 'public',
						table,
						filter,
					},
					(payload: PostgresChangesPayload) => {
						// DELETE events are never filtered server-side, so `one` / `many` check the id here.
						const record = payload.eventType === 'DELETE' ? payload.old : payload.new
						const id = record?.[idColumn]
						if (ids && !ids.includes(String(id)))
							return

						callback({
							channel,
							action: EVENT_TO_ACTION[payload.eventType],
							payload: {
								ids: id == null ? undefined : [id],
								data: record,
							},
							date: new Date(payload.commit_timestamp),
							meta,
						})
					},
				)
			}

			channels.set(key, realtimeChannel.subscribe())

			return key
		},
		unsubscribe: (key) => {
			const realtimeChannel = channels.get(key)
			if (!realtimeChannel)
				return

			channels.delete(key)
			client.removeChannel(realtimeChannel)
		},
	})
}

function getEvents(
	actions: RealtimeActionValues[],
): (PostgresEvent | '*')[] {
	const events = actions.map(action => ACTION_TO_EVENT[action] ?? '*')
	return events.includes('*') ? ['*'] : [...new Set(events)]
}

function getIds(
	params: SubscribeProps<any, any>['params'],
): string[] | undefined {
	switch ((params as Params | undefined)?.type) {
		case SubscribeType.One:
			return [String((params as SubscribeOneParams).id)]
		case SubscribeType.Many:
			return (params as SubscribeManyParams).ids.map(String)
	}
}

// Supabase realtime accepts a single `column=op.value` filter with eq, neq, lt, lte, gt, gte, in.
function getFilter(
	params: SubscribeProps<any, any>['params'],
	idColumn: string,
): string | undefined {
	switch ((params as Params | undefined)?.type) {
		case SubscribeType.One:
			return `${idColumn}=eq.${(params as SubscribeOneParams).id}`
		case SubscribeType.Many:
			return `${idColumn}=in.(${(params as SubscribeManyParams).ids.join(',')})`
		case SubscribeType.List:
			return getListFilter((params as SubscribeListParams<any>).filters)
	}
}

const LIST_OPERATORS: Record<string, string> = {
	eq: 'eq',
	ne: 'neq',
	lt: 'lt',
	lte: 'lte',
	gt: 'gt',
	gte: 'gte',
	in: 'in',
}

function getListFilter(
	filters: Filters | undefined,
): string | undefined {
	const filter = filters?.find(item => isLogicalFilter(item) && item.operator in LIST_OPERATORS)
	if (!filter || !isLogicalFilter(filter))
		return

	const value = filter.operator === 'in'
		? `(${(filter.value as any[]).join(',')})`
		: filter.value

	return `${filter.field}=${LIST_OPERATORS[filter.operator]}.${value}`
}
