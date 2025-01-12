import type { Realtime } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<Realtime> = Symbol('@ginjou/realtime')

export function defineRealtimeContext<
	T extends InjectionGetter<Realtime>,
>(
	value: T,
	provideFn: ProvideFn = provide,
): T {
	provideFn(KEY, value)
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
	const value = injectGetter(KEY) ?? props?.realtime
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
