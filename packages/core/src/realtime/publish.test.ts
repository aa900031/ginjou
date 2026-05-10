import { describe, expect, it, vi } from 'vitest'
import { createEmitFn } from './publish'

describe('createEmitFn', () => {
	it('should do nothing when realtime publish is unavailable', () => {
		const emit = createEmitFn({
			realtime: undefined,
		})

		expect(() => emit({
			channel: 'posts',
			action: 'created',
			payload: { id: '1' },
		})).not.toThrow()
	})

	it('should publish an event with a generated date when date is missing', () => {
		const publish = vi.fn()
		const emit = createEmitFn({
			realtime: {
				subscribe: vi.fn(),
				publish,
			},
		})

		emit({
			channel: 'posts',
			action: 'created',
			payload: { id: '1' },
		})

		expect(publish).toHaveBeenCalledTimes(1)
		expect(publish.mock.calls[0]![0]).toMatchObject({
			channel: 'posts',
			action: 'created',
			payload: { id: '1' },
		})
		expect(publish.mock.calls[0]![0].date).toBeInstanceOf(Date)
	})

	it('should preserve a provided event date', () => {
		const publish = vi.fn()
		const date = new Date('2026-05-10T00:00:00.000Z')
		const emit = createEmitFn({
			realtime: {
				subscribe: vi.fn(),
				publish,
			},
		})

		emit({
			channel: 'posts',
			action: 'updated',
			payload: { id: '1' },
			date,
		})

		expect(publish).toHaveBeenCalledWith({
			channel: 'posts',
			action: 'updated',
			payload: { id: '1' },
			date,
		})
	})
})
