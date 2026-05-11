import { describe, expect, it, vi } from 'vitest'
import { merge } from './options'
import { RealtimeMode } from './realtime'

describe('merge', () => {
	it('should default mode to auto', () => {
		const options = merge(undefined, undefined)

		expect(options.mode).toBe(RealtimeMode.Auto)
	})

	it('should prefer options mode over context mode', () => {
		const options = merge(
			{ mode: RealtimeMode.Manual },
			{ mode: RealtimeMode.Off },
		)

		expect(options.mode).toBe(RealtimeMode.Manual)
	})

	it('should use context mode when options mode is missing', () => {
		const options = merge(
			undefined,
			{ mode: RealtimeMode.Off },
		)

		expect(options.mode).toBe(RealtimeMode.Off)
	})

	it('should use channel from options only', () => {
		const options = merge(
			{ channel: 'posts' },
			{ mode: RealtimeMode.Auto },
		)

		expect(options.channel).toBe('posts')
	})

	it('should merge params with options taking precedence', () => {
		const options = merge(
			{
				params: {
					resource: 'comments',
					page: 2,
				},
			},
			{
				params: {
					resource: 'posts',
					filter: 'published',
				},
			},
		)

		expect(options.params).toEqual({
			resource: 'comments',
			filter: 'published',
			page: 2,
		})
	})

	it('should keep params undefined when both sources are missing', () => {
		const options = merge(
			{ channel: 'posts' },
			{ mode: RealtimeMode.Auto },
		)

		expect(options.params).toBeUndefined()
	})

	it('should call both callbacks in order', () => {
		const calls: string[] = []
		const optionCallback = vi.fn(() => calls.push('option'))
		const contextCallback = vi.fn(() => calls.push('context'))
		const options = merge(
			{
				callback: optionCallback,
			},
			{
				callback: contextCallback,
			},
		)
		const event = {
			channel: 'posts',
			action: 'created' as const,
			payload: { id: '1' },
			date: new Date('2026-05-10T00:00:00.000Z'),
		}

		options.callback?.(event)

		expect(optionCallback).toHaveBeenCalledWith(event)
		expect(contextCallback).toHaveBeenCalledWith(event)
		expect(calls).toEqual(['option', 'context'])
	})

	it('should expose a callback even when no callbacks are provided', () => {
		const options = merge(undefined, undefined)

		expect(() => options.callback?.({
			channel: 'posts',
			action: 'created',
			payload: { id: '1' },
			date: new Date('2026-05-10T00:00:00.000Z'),
		})).not.toThrow()
	})
})
