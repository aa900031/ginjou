import type { Fetchers, Realtime } from '@ginjou/core'
import type { QueryClient } from '@tanstack/vue-query'
import type { RenderResult } from '@testing-library/vue'
import type { Component, DefineComponent } from 'vue'
import { render } from '@testing-library/vue'
import { defineComponent, h, provide } from 'vue'
import { defineFetchers } from '../src/query'
import { defineRealtimeContext } from '../src/realtime'

export function mountSetup<
	TSetupFn extends () => any,
>(
	setup: TSetupFn,
	Wapper?: (Comp: Component) => DefineComponent,
): RenderResult & { result: ReturnType<TSetupFn> } {
	let result: ReturnType<TSetupFn>
	const Comp = defineComponent({
		setup: () => {
			result = setup()
			return () => h('div')
		},
	})

	const rednered = render(Wapper ? Wapper(Comp) : Comp)
	;(rednered as any).result = result!

	return rednered as any
}

export interface TestAppContexts {
	queryClient?: QueryClient
	fetchers?: Fetchers
	realtime?: Realtime
}

export function mountTestApp<
	TSetupFn extends () => any,
>(
	setup: TSetupFn,
	contexts?: TestAppContexts,
): RenderResult & { result: ReturnType<TSetupFn> } {
	return mountSetup(
		setup,
		Comp => ({
			components: Comp,
			setup: () => {
				contexts?.fetchers && defineFetchers(contexts.fetchers)
				contexts?.realtime && defineRealtimeContext(contexts.realtime)
				contexts?.queryClient && provide('VUE_QUERY_CLIENT', contexts?.queryClient)

				return () => h(Comp)
			},
		} as any),
	)
}
