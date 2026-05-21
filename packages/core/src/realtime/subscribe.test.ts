import { describe, expect, it, vi } from 'vitest'
import { RealtimeAction } from './realtime'
import { register, resolveProps } from './subscribe'

describe('resolveProps', () => {
	it('should fill default actions and callback', () => {
		const props = resolveProps({
			channel: 'posts',
		})

		expect(props.actions).toEqual([RealtimeAction.Any])
		expect(typeof props.callback).toBe('function')
	})

	it('should preserve provided actions and callback', () => {
		const callback = vi.fn()
		const props = resolveProps({
			channel: 'posts',
			actions: [RealtimeAction.Created],
			callback,
		})

		expect(props.actions).toEqual([RealtimeAction.Created])
		expect(props.callback).toBe(callback)
	})
})

describe('register', () => {
	it('should return a noop disposer when realtime is missing', () => {
		const callback = vi.fn()
		const props = resolveProps({
			channel: 'posts',
			callback,
		})

		const dispose = register({ props, realtime: undefined })
		expect(() => dispose()).not.toThrow()
	})

	it('should skip subscription when enabled returns false', () => {
		const subscribe = vi.fn()
		const props = resolveProps({
			channel: 'posts',
			enabled: () => false,
		})

		const dispose = register({
			props,
			realtime: {
				subscribe,
			},
		})

		expect(subscribe).not.toHaveBeenCalled()
		expect(() => dispose()).not.toThrow()
	})

	it('should subscribe with resolved props except enabled and unsubscribe with returned id', () => {
		const callback = vi.fn()
		const subscribe = vi.fn(() => 'subscription-id')
		const unsubscribe = vi.fn()
		const props = resolveProps({
			channel: 'posts',
			actions: [RealtimeAction.Updated],
			callback,
			enabled: () => true,
			params: { resource: 'posts' },
		})

		const dispose = register({
			props,
			realtime: {
				subscribe,
				unsubscribe,
			},
		})

		expect(subscribe).toHaveBeenCalledWith({
			channel: 'posts',
			actions: [RealtimeAction.Updated],
			callback,
			params: { resource: 'posts' },
		})

		dispose()
		expect(unsubscribe).toHaveBeenCalledWith('subscription-id')
	})

	it('should allow disposing when unsubscribe is not provided', () => {
		const subscribe = vi.fn(() => 'subscription-id')
		const props = resolveProps({
			channel: 'posts',
		})

		const dispose = register({
			props,
			realtime: {
				subscribe,
			},
		})

		expect(() => dispose()).not.toThrow()
	})
})
