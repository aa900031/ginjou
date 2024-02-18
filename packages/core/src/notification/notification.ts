import type { ValueOf } from 'type-fest'

export const NotificationType = {
	Success: 'success',
	Error: 'error',
	// Progress: 'progress'
} as const

export type NotificationTypeValues = ValueOf<typeof NotificationType>

export interface OpenNotificationParams {
	type: NotificationTypeValues
	message: string
	key?: string
	description?: string
	cancelMutation?: () => void
	undoableTimeout?: number
}

export type NotificationOpenFn = (params: OpenNotificationParams) => void

export type NotificationCloseFn = (key: string) => void

export interface Notification {
	open: NotificationOpenFn
	close: NotificationCloseFn
}
