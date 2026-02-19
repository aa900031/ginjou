import type { Realtime } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { injectLocal, provideLocal } from '@vueuse/shared'

const KEY: InjectionKey<Realtime> = Symbol('@ginjou/realtime')

export function defineRealtimeContext<
	T extends Realtime,
>(
	value: T,
): T {
	provideLocal(KEY, value)
	return value
}

export interface UseRealtimeContextFromProps {
	realtime?: Realtime
}

export type UseRealtimeContextProps = Simplify<
	& UseRealtimeContextFromProps
	& {
		strict?: boolean
	}
>

export function useRealtimeContext(
	props: UseRealtimeContextProps & { strict: true },
): Realtime

export function useRealtimeContext(
	props?: UseRealtimeContextProps,
): Realtime | undefined

export function useRealtimeContext(
	props?: UseRealtimeContextProps,
): Realtime | undefined {
	const value = injectLocal(KEY, undefined) ?? props?.realtime
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
