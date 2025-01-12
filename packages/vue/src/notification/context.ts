import type { Notification } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<Notification> = Symbol('@ginjou/notification')

export function defineNotificationContext<
	T extends InjectionGetter<Notification>,
>(
	value: T,
	provideFn: ProvideFn = provide,
): T {
	provideFn(KEY, value)
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
	const value = injectGetter(KEY) ?? props?.notification
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
