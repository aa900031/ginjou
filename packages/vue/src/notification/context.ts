import type { Notification } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { injectLocal, provideLocal } from '@vueuse/shared'

const KEY: InjectionKey<Notification> = Symbol('@ginjou/notification')

export function defineNotificationContext<
	T extends Notification,
>(
	value: T,
): T {
	provideLocal(KEY, value)
	return value
}

export interface UseNotificationContextFromProps {
	notification?: Notification
}

export type UseNotificationContextProps = Simplify<
	& UseNotificationContextFromProps
	& {
		strict?: boolean
	}
>

export function useNotificationContext(
	props: UseNotificationContextProps & { strict: true },
): Notification

export function useNotificationContext(
	props?: UseNotificationContextProps,
): Notification | undefined

export function useNotificationContext(
	props?: UseNotificationContextProps,
): Notification | undefined {
	const value = injectLocal(KEY, undefined) ?? props?.notification
	if (props?.strict === true && value == null)
		throw new Error('[@ginjou/vue] No notification context found. Use defineNotificationContext() at app setup or pass notification through context props.')
	return value
}
