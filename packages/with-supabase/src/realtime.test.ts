import { describe, expect, it, vi } from 'vitest'
import { createRealtime } from './realtime'

function createClient() {
	const channel: Record<string, any> = {
		on: vi.fn(() => channel),
		subscribe: vi.fn(() => channel),
	}
	const client = {
		channel: vi.fn(() => channel),
		removeChannel: vi.fn(),
	}

	return { client, channel }
}

function emit(channel: Record<string, any>, payload: Record<string, any>) {
	for (const [, , listener] of channel.on.mock.calls)
		listener(payload)
}

describe('createRealtime', () => {
	it('should map actions to postgres events on the resource table', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })

		realtime.subscribe({
			channel: 'resources/posts',
			actions: ['created', 'deleted'],
			callback: vi.fn(),
		})

		expect(channel.on).toHaveBeenCalledTimes(2)
		expect(channel.on).toHaveBeenCalledWith(
			'postgres_changes',
			{ event: 'INSERT', schema: 'public', table: 'posts', filter: undefined },
			expect.any(Function),
		)
		expect(channel.on).toHaveBeenCalledWith(
			'postgres_changes',
			{ event: 'DELETE', schema: 'public', table: 'posts', filter: undefined },
			expect.any(Function),
		)
		expect(channel.subscribe).toHaveBeenCalled()
	})

	it('should collapse any action into a single wildcard listener', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })

		realtime.subscribe({
			channel: 'resources/posts',
			actions: ['*', 'created'],
			callback: vi.fn(),
			meta: { schema: 'app' },
		})

		expect(channel.on).toHaveBeenCalledTimes(1)
		expect(channel.on).toHaveBeenCalledWith(
			'postgres_changes',
			{ event: '*', schema: 'app', table: 'posts', filter: undefined },
			expect.any(Function),
		)
	})

	it('should translate one, many and list params into a server-side filter', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })
		const callback = vi.fn()

		realtime.subscribe({
			channel: 'resources/posts',
			actions: ['*'],
			callback,
			params: { type: 'one', resource: 'posts', id: 1 },
		})
		realtime.subscribe({
			channel: 'resources/posts',
			actions: ['*'],
			callback,
			params: { type: 'many', resource: 'posts', ids: [1, 2] },
			meta: { idColumnName: 'post_id' },
		})
		realtime.subscribe({
			channel: 'resources/posts',
			actions: ['*'],
			callback,
			params: {
				type: 'list',
				resource: 'posts',
				filters: [
					{ field: 'title', operator: 'contains', value: 'x' },
					{ field: 'status', operator: 'ne', value: 'draft' },
				],
			},
		})

		const filters = channel.on.mock.calls.map(([, options]: any[]) => options.filter)
		expect(filters).toEqual([
			'id=eq.1',
			'post_id=in.(1,2)',
			'status=neq.draft',
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

		expect(callback).toHaveBeenCalledTimes(2)
		expect(callback).toHaveBeenNthCalledWith(1, {
			channel: 'resources/posts',
			action: 'updated',
			payload: { ids: [2], data: { id: 2, title: 'b' } },
			date: new Date('2026-01-01T00:00:00Z'),
			meta: undefined,
		})
		expect(callback).toHaveBeenNthCalledWith(2, expect.objectContaining({
			action: 'deleted',
			payload: { ids: [1], data: { id: 1 } },
		}))
	})

	it('should remove the channel on unsubscribe', () => {
		const { client, channel } = createClient()
		const realtime = createRealtime({ client: client as any })

		const key = realtime.subscribe({ channel: 'resources/posts', actions: ['*'], callback: vi.fn() })
		realtime.unsubscribe(key)
		realtime.unsubscribe(key)

		expect(client.removeChannel).toHaveBeenCalledTimes(1)
		expect(client.removeChannel).toHaveBeenCalledWith(channel)
	})
})
