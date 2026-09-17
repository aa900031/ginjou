import type { RealtimeActionValues, RecordKey, SubscribeListParams, SubscribeManyParams, SubscribeOneParams, SubscribeProps } from '@ginjou/core'
import type { RealtimeChannel, RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js'
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

const EVENTS: Record<string, PostgresEvent | '*'> = {
	[RealtimeAction.Created]: 'INSERT',
	[RealtimeAction.Updated]: 'UPDATE',
	[RealtimeAction.Deleted]: 'DELETE',
	[RealtimeAction.Any]: '*',
}

const ACTIONS: Record<PostgresEvent, RealtimeActionValues> = {
	INSERT: RealtimeAction.Created,
	UPDATE: RealtimeAction.Updated,
	DELETE: RealtimeAction.Deleted,
}

// Postgres Changes accepts a single `column=op.value` filter with these operators only.
const OPERATORS: Record<string, string> = {
	eq: 'eq',
	ne: 'neq',
	lt: 'lt',
	lte: 'lte',
	gt: 'gt',
	gte: 'gte',
	in: 'in',
}

// `client.channel(topic)` returns the existing channel for a known topic, so every subscribe() (across
// provider instances on one client) needs its own topic or unsubscribe() would tear down its siblings.
let seq = 0

// eslint-disable-next-line ts/explicit-function-return-type
export function createRealtime(
	{
		client,
	}: CreateRealtimeProps,
) {
	const channels = new Map<string, RealtimeChannel>()

	return defineRealtime({
		subscribe: ({ channel, actions, callback, params, meta }: SubscribeProps<RealtimePayload, any>) => {
			const _params = params as Params | undefined
			const _meta = meta as RealtimeMeta | undefined
			const table = _params?.resource ?? channel.replace(/^resources\//, '')
			const idColumn = _meta?.idColumnName ?? 'id'
			const ids = getIds(_params)
			const key = `${channel}:${++seq}`

			let realtimeChannel = client.channel(key)
			for (const event of getEvents(actions)) {
				realtimeChannel = realtimeChannel.on(
					'postgres_changes',
					{
						event,
						// @ts-expect-error `rest` is protected; realtime does not inherit the client's `db.schema`.
						schema: _meta?.schema ?? client.rest?.schemaName ?? 'public',
						table,
						filter: getFilter(_params, idColumn),
					},
					(payload: RealtimePostgresChangesPayload<Record<string, any>>) => {
						const record = payload.eventType === 'DELETE' ? payload.old : payload.new
						const id = record[idColumn]
						// DELETE is never filtered server-side, so `one` / `many` check the id here.
						// Fail open when the payload carries no id column.
						if (ids && id != null && !ids.includes(String(id)))
							return

						callback({
							channel,
							action: ACTIONS[payload.eventType],
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

			channels.set(key, realtimeChannel.subscribe((status, error) => {
				if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')
					console.warn(`[@ginjou/with-supabase] Realtime subscription "${key}" failed: ${status}`, error)
			}))

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
	const events = new Set(actions.map(action => EVENTS[action]).filter(Boolean))
	return events.has('*') ? ['*'] : [...events]
}

function getIds(
	params: Params | undefined,
): string[] | undefined {
	switch (params?.type) {
		case SubscribeType.One:
			return [String(params.id)]
		case SubscribeType.Many:
			return params.ids.map(String)
	}
}

function getFilter(
	params: Params | undefined,
	idColumn: string,
): string | undefined {
	switch (params?.type) {
		case SubscribeType.One:
			return `${idColumn}=eq.${params.id}`
		case SubscribeType.Many:
			return params.ids.length ? `${idColumn}=in.(${params.ids.join(',')})` : undefined
		case SubscribeType.List: {
			// ponytail: first supported filter only, and it also narrows UPDATE, so rows leaving a filtered
			// list are missed. Subscribe UPDATE without a filter if that matters.
			const filter = params.filters?.find(item => isLogicalFilter(item) && item.operator in OPERATORS)
			if (!filter || !isLogicalFilter(filter))
				return

			const value = filter.operator === 'in'
				? `(${([] as unknown[]).concat(filter.value).join(',')})`
				: filter.value

			return `${filter.field}=${OPERATORS[filter.operator]}.${value}`
		}
	}
}
