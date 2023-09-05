import type { RenderResult } from '@testing-library/vue'
import { render } from '@testing-library/vue'
import type { Component, DefineComponent } from 'vue'
import { defineComponent, h, provide } from 'vue'
import { defineFetchers } from '../src/fetchers'
import { MockFetchers, queryClient } from './setup'

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

export function mountTestApp<
	TSetupFn extends () => any,
>(
	setup: TSetupFn,
): RenderResult & { result: ReturnType<TSetupFn> } {
	return mountSetup(
		setup,
		Comp => ({
			components: Comp,
			setup: () => {
				defineFetchers(MockFetchers)
				provide('VUE_QUERY_CLIENT', queryClient)
				return () => h(Comp)
			},
		} as any),
	)
}
