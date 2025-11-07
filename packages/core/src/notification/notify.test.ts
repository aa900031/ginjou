import type { Notification, OpenNotificationParams } from './notification'
import { describe, expect, it, vi } from 'vitest'
import { createNotifyFn } from './notify'

describe('createNotifyFn', () => {
	it('should return a function', () => {
		const notify = createNotifyFn({})
		expect(typeof notify).toBe('function')
	})

	describe('notify', () => {
		it('should do nothing if notification is not provided', () => {
			const openFn = vi.fn()
			const _mockNotification: Notification = {
				open: openFn,
				close: vi.fn(),
			}
			const notifyWithUndefined = createNotifyFn({ notification: undefined })
			notifyWithUndefined({
				type: 'success',
				message: 'test',
			})
			expect(openFn).not.toHaveBeenCalled()
		})

		it('should do nothing if params is false', () => {
			const openFn = vi.fn()
			const mockNotification: Notification = {
				open: openFn,
				close: vi.fn(),
			}
			const notify = createNotifyFn({ notification: mockNotification })
			notify(false)
			expect(openFn).not.toHaveBeenCalled()
		})

		it('should do nothing if params and fallback are not provided', () => {
			const openFn = vi.fn()
			const mockNotification: Notification = {
				open: openFn,
				close: vi.fn(),
			}
			const notify = createNotifyFn({ notification: mockNotification })
			notify(undefined)
			expect(openFn).not.toHaveBeenCalled()
		})

		it('should call notification.open with params when params is provided', () => {
			const openFn = vi.fn()
			const mockNotification: Notification = {
				open: openFn,
				close: vi.fn(),
			}
			const notify = createNotifyFn({ notification: mockNotification })
			const params: OpenNotificationParams = {
				type: 'success',
				message: 'Hello',
			}
			notify(params)
			expect(openFn).toHaveBeenCalledWith(params)
		})

		it('should call notification.open with fallback when params is undefined', () => {
			const openFn = vi.fn()
			const mockNotification: Notification = {
				open: openFn,
				close: vi.fn(),
			}
			const notify = createNotifyFn({ notification: mockNotification })
			const fallback: OpenNotificationParams = {
				type: 'success',
				message: 'Fallback',
			}
			notify(undefined, fallback)
			expect(openFn).toHaveBeenCalledWith(fallback)
		})

		it('should call notification.open with params when both params and fallback are provided', () => {
			const openFn = vi.fn()
			const mockNotification: Notification = {
				open: openFn,
				close: vi.fn(),
			}
			const notify = createNotifyFn({ notification: mockNotification })
			const params: OpenNotificationParams = {
				type: 'success',
				message: 'Hello',
			}
			const fallback: OpenNotificationParams = {
				type: 'success',
				message: 'Fallback',
			}
			notify(params, fallback)
			expect(openFn).toHaveBeenCalledWith(params)
		})
	})
})
