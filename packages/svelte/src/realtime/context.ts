import type { Realtime } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/realtime')

export function defineRealtimeContext<T extends Realtime>(value: T): T {
	return defineContext(KEY, value)
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
	const value = useContextValue(KEY, props?.realtime)

	if (props?.strict === true)
		return requireContext(value, 'realtime')

	return value
}
