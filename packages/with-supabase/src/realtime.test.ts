import { describe, expect, it, vi } from 'vitest'
import { createRealtime } from './realtime'

function createClient(schemaName?: string) {
	const channel: Record<string, any> = {
		on: vi.fn(() => channel),
		subscribe: vi.fn(() => channel),
	}
	const client = {
		rest: { schemaName },
		channel: vi.fn(() => channel),
		removeChannel: vi.fn(),
	}

	return { client, channel }
}

function optionsOf(channel: Record<string, any>): Record<string, any>[] {
	return channel.on.mock.calls.map(([, options]: any[]) => options)
}

function emit(channel: Record<string, any>, payload: Record<string, any>) {
	for (const [, options, listener] of channel.on.mock.calls) {
		if (options.event === '*' || options.event === payload.eventType)
			listener(payload)
	}
}

describe('createRealtime', () => {
	it('should map actions to postgres events on the resource table', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })

		realtime.subscribe({ channel: 'resources/posts', actions: ['created', 'deleted', 'archived'], callback: vi.fn() })
		realtime.subscribe({ channel: 'resources/posts', actions: ['*', 'created'], callback: vi.fn(), meta: { schema: 'app' } })

		expect(optionsOf(channel)).toEqual([
			{ event: 'INSERT', schema: 'public', table: 'posts', filter: undefined },
			{ event: 'DELETE', schema: 'public', table: 'posts', filter: undefined },
			{ event: '*', schema: 'app', table: 'posts', filter: undefined },
		])
		expect(channel.subscribe).toHaveBeenCalledTimes(2)
	})

	it('should inherit the client schema and use params.resource as the table', () => {
		const { client, channel } = createClient('tenant')
		const realtime = createRealtime({ client: client as any })

		realtime.subscribe({
			channel: 'custom',
			actions: ['*'],
			callback: vi.fn(),
			params: { type: 'one', resource: 'orders', id: 1 },
		})

		expect(optionsOf(channel)).toEqual([
			{ event: '*', schema: 'tenant', table: 'orders', filter: 'id=eq.1' },
		])
	})

	it('should translate one, many and list params into a server-side filter', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })
		const subscribe = (params: Record<string, any>, meta?: Record<string, any>) =>
			realtime.subscribe({ channel: 'resources/posts', actions: ['created'], callback: vi.fn(), params, meta })

		subscribe({ type: 'one', resource: 'posts', id: 1 })
		subscribe({ type: 'many', resource: 'posts', ids: [1, 2] }, { idColumnName: 'post_id' })
		subscribe({ type: 'many', resource: 'posts', ids: [] })
		subscribe({
			type: 'list',
			resource: 'posts',
			filters: [
				{ field: 'title', operator: 'contains', value: 'x' },
				{ field: 'status', operator: 'ne', value: 'draft' },
				{ field: 'id', operator: 'eq', value: 1 },
			],
		})
		subscribe({ type: 'list', resource: 'posts', filters: [{ field: 'status', operator: 'in', value: ['a', 'b'] }] })
		subscribe({ type: 'list', resource: 'posts', filters: [{ field: 'title', operator: 'contains', value: 'x' }] })

		expect(optionsOf(channel).map(options => options.filter)).toEqual([
			'id=eq.1',
			'post_id=in.(1,2)',
			undefined,
			'status=neq.draft',
			'status=in.(a,b)',
			undefined,
		])
	})

	it('should emit ginjou events and skip records outside the subscribed ids', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })
		const callback = vi.fn()

		realtime.subscribe({
			channel: 'resources/posts',
			actions: ['*'],
			callback,
			params: { type: 'many', resource: 'posts', ids: [1, 2] },
		})

		emit(channel, { eventType: 'UPDATE', new: { id: 2, title: 'b' }, old: {}, commit_timestamp: '2026-01-01T00:00:00Z' })
		emit(channel, { eventType: 'DELETE', new: {}, old: { id: 1 }, commit_timestamp: '2026-01-01T00:00:01Z' })
		emit(channel, { eventType: 'UPDATE', new: { id: 3 }, old: {}, commit_timestamp: '2026-01-01T00:00:02Z' })
		// DELETE payloads only carry primary-key columns; fail open when the id column is missing.
		emit(channel, { eventType: 'DELETE', new: {}, old: {}, commit_timestamp: '2026-01-01T00:00:03Z' })

		expect(callback.mock.calls.map(([event]) => [event.action, event.payload])).toEqual([
			['updated', { ids: [2], data: { id: 2, title: 'b' } }],
			['deleted', { ids: [1], data: { id: 1 } }],
			['deleted', { ids: undefined, data: {} }],
		])
		expect(callback).toHaveBeenNthCalledWith(1, {
			channel: 'resources/posts',
			action: 'updated',
			payload: { ids: [2], data: { id: 2, title: 'b' } },
			date: new Date('2026-01-01T00:00:00Z'),
			meta: undefined,
		})
	})

	it('should warn when the subscription fails', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		realtime.subscribe({ channel: 'resources/posts', actions: ['*'], callback: vi.fn() })
		const onStatus = channel.subscribe.mock.calls[0][0]
		onStatus('SUBSCRIBED')
		onStatus('CHANNEL_ERROR', new Error('nope'))

		expect(warn).toHaveBeenCalledTimes(1)
		warn.mockRestore()
	})

	it('should create unique topics across provider instances and remove the channel once', () => {
		const { client, channel } = createClient()
		const a = createRealtime({ client: client as any })
		const b = createRealtime({ client: client as any })

		const key = a.subscribe({ channel: 'resources/posts', actions: ['*'], callback: vi.fn() })
		b.subscribe({ channel: 'resources/posts', actions: ['*'], callback: vi.fn() })
		a.unsubscribe(key)
		a.unsubscribe(key)

		const [keyA, keyB] = client.channel.mock.calls.map(([key]: any[]) => key)
		expect(keyA).not.toBe(keyB)
		expect(client.removeChannel).toHaveBeenCalledTimes(1)
		expect(client.removeChannel).toHaveBeenCalledWith(channel)
	})
})
