import type { ValueOf } from 'type-fest'

export const NotificationType = {
	Success: 'success',
	Error: 'error',
	Progress: 'progress',
} as const

export type NotificationTypeValues = ValueOf<typeof NotificationType>

export interface NormalNotificationParams {
	type: typeof NotificationType.Success | typeof NotificationType.Error
	message: string
	description?: string
	key?: string
}

export interface ProgressNotificationParams extends Omit<NormalNotificationParams, 'type'> {
	type: typeof NotificationType.Progress
	timeout: number
	onFinish: () => void
	onCancel: () => void
}

export type OpenNotificationParams
	= | NormalNotificationParams
		| ProgressNotificationParams

export type NotificationOpenFn = (
	params: OpenNotificationParams,
) => void

export type NotificationCloseFn = (
	key: string,
) => void

export interface Notification {
	open: NotificationOpenFn
	close: NotificationCloseFn
}

/* @__NO_SIDE_EFFECTS__ */
export function defineNotification<
	T extends Notification,
>(
	value: T,
): T {
	return value
}
