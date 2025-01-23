import type { Realtime } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { getContext, setContext } from 'svelte'

const KEY = '$$_@ginjou/realtime'

export function defineRealtimeContext<
	T extends Realtime,
>(
	value: T,
): T {
	setContext(KEY, value)
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
	const value = getContext<Realtime>(KEY) ?? props?.realtime
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
