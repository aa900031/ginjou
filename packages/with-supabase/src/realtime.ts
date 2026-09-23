import type { Filter, LogicalFilter, RealtimeActionValues, RecordKey, SubscribeListParams, SubscribeManyParams, SubscribeOneParams, SubscribeProps } from '@ginjou/core'
import type { RealtimeChannel, RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js'
import { defineRealtime, FilterOperator, isLogicalFilter, RealtimeAction, SubscribeType } from '@ginjou/core'

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

// eslint-disable-next-line ts/explicit-function-return-type
export function createRealtime(
	{
		client,
	}: CreateRealtimeProps,
) {
	const channels = new Map<string, RealtimeChannel>()
	// `client.channel(topic)` returns the existing channel for a known topic, so every subscribe() needs its
	// own topic or unsubscribe() would tear down its siblings - and `.on()` throws on an already joined one.
	// The random prefix keeps topics unique across provider instances and across duplicated copies of this
	// module (an ESM and a CJS build in the same bundle would otherwise both start counting from zero).
	const prefix = Math.random().toString(36).slice(2, 8)
	let seq = 0

	return defineRealtime({
		subscribe: ({ channel, actions, callback, params, meta }: SubscribeProps<RealtimePayload, any>) => {
			const _params = params as Params | undefined
			const _meta = meta as RealtimeMeta | undefined
			const idColumn = _meta?.idColumnName ?? 'id'
			const ids = getIds(_params)
			const key = `${channel}:${prefix}-${++seq}`
			const events = getEvents(actions)
			// Nothing to listen to: skip the channel instead of joining one that can never emit. An empty
			// `ids` list has no server-side filter to narrow it, so it would stream the whole table only to
			// drop every row here.
			if (!events.length || ids?.length === 0)
				return key

			const table = _params?.resource ?? channel.replace(/^resources\//, '')
			// @ts-expect-error `rest` is protected; realtime does not inherit the client's `db.schema`.
			const schema: string = _meta?.schema ?? client.rest?.schemaName ?? 'public'
			const filter = getFilter(_params, idColumn)

			const realtimeChannel = client.channel(key)
			for (const event of events) {
				realtimeChannel.on(
					'postgres_changes',
					{
						event,
						schema,
						table,
						filter,
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

			channels.set(key, realtimeChannel)
			realtimeChannel.subscribe((status, error) => {
				if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')
					console.warn(`[@ginjou/with-supabase] Realtime subscription "${key}" failed: ${status}`, error)
			})

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
	// `hasOwn` keeps inherited members (`toString`, `constructor`, ...) out: an action is any string.
	const events = new Set(actions.filter(action => Object.hasOwn(EVENTS, action)).map(action => EVENTS[action]))
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
			return params.ids.length > 0 && params.ids.every(isInValue)
				? `${idColumn}=in.(${params.ids.join(',')})`
				: undefined
		case SubscribeType.List: {
			const filter = params.filters?.find(isSupportedFilter)
			if (!filter)
				return

			const value = filter.operator === FilterOperator.in
				? `(${(filter.value as unknown[]).join(',')})`
				: filter.value

			return `${filter.field}=${OPERATORS[filter.operator]}.${value}`
		}
	}
}

// A realtime filter names a plain column of the subscribed table. A dotted path into an embedded resource
// (`author.name`), which the fetcher does accept, is not a column here: the server rejects the whole join
// with CHANNEL_ERROR and the subscription then delivers nothing at all.
const COLUMN_RE = /^[a-z_]\w*$/i

function isSupportedFilter(
	item: Filter,
): item is LogicalFilter {
	if (!isLogicalFilter(item) || !Object.hasOwn(OPERATORS, item.operator) || !COLUMN_RE.test(item.field))
		return false

	// A realtime filter is a plain `column=op.value` string, so only primitives survive it: a Date or an
	// object stringifies into something the server can never match. Skip those - an unfiltered stream is
	// always a safe superset of the query.
	return item.operator === FilterOperator.in
		? Array.isArray(item.value) && item.value.length > 0 && item.value.every(isInValue)
		: isFilterValue(item.value)
}

function isFilterValue(
	value: unknown,
): boolean {
	return typeof value === 'string'
		|| typeof value === 'number'
		|| typeof value === 'boolean'
}

// `in.(a,b)` splits on commas, so a value carrying one would be sent as several wrong values and the real
// record would never match. Fall back to no filter instead of a filter that silently drops events.
function isInValue(
	value: unknown,
): boolean {
	return isFilterValue(value) && !String(value).includes(',')
}
