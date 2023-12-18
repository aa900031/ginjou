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

export interface Notification {
	open: (params: OpenNotificationParams) => void
	close: (key: string) => void
}

export function defaultNotificationOpen(_params: OpenNotificationParams) {
	// TODO: Show warning at Dev mode
}
