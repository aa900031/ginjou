import type { Realtime } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { inject, type InjectionKey, provide } from 'vue-demi'

const KEY: InjectionKey<Realtime> = Symbol('@ginjou/realtime')

export function defineRealtimeContext<
	T extends Realtime,
>(
	value: T,
): T {
	provide(KEY, value)
	return value
}

export interface UseRealtimeContextFormProps {
	realtime?: Realtime
}

export type UseRealtimeContextProps = Simplify<
	& UseRealtimeContextFormProps
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
	const value = inject(KEY, undefined) ?? props?.realtime
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
