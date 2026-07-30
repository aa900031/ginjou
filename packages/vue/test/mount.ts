import type { Fetchers, Realtime } from '@ginjou/core'
import type { QueryClient } from '@tanstack/vue-query'
import type { RenderResult } from '@testing-library/vue'
import type { Component, DefineComponent } from 'vue'
import { render } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { defineFetchersContext, defineQueryClientContext } from '../src/query'
import { defineRealtimeContext } from '../src/realtime'

export function mountSetup<
	TSetupFn extends () => any,
>(
	setup: TSetupFn,
	Wrapper?: (Comp: Component) => DefineComponent,
): RenderResult & { result: ReturnType<TSetupFn> } {
	let result: ReturnType<TSetupFn>
	const Comp = defineComponent({
		setup: () => {
			result = setup()
			return () => h('div')
		},
	})

	const rendered = render(Wrapper ? Wrapper(Comp) : Comp)
	;(rendered as any).result = result!

	return rendered as any
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
				contexts?.fetchers && defineFetchersContext(contexts.fetchers)
				contexts?.realtime && defineRealtimeContext(contexts.realtime)
				contexts?.queryClient && defineQueryClientContext(contexts.queryClient)

				return () => h(Comp)
			},
		} as any),
	)
}
