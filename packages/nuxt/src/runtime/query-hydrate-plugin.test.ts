import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNuxtApp, useState } from '#imports'
import plugin from './query-hydrate-plugin'

const mocks = vi.hoisted(() => ({
	setQueryClientDehydrateState: vi.fn(),
}))

vi.mock('@ginjou/vue', () => ({
	getQueryClients: vi.fn(),
	setQueryClientDehydrateState: mocks.setQueryClientDehydrateState,
}))

vi.mock('@tanstack/vue-query', () => ({
	dehydrate: vi.fn(),
}))

describe('query hydrate plugin', () => {
	beforeEach(() => {
		mocks.setQueryClientDehydrateState.mockReset()
	})

	it('should restore every dehydrated query client on the client', () => {
		const state = useState<Record<string, any> | null>('ginjou-query/dehydrated-state-map')
		state.value = {
			admin: { mutations: [], queries: [] },
			default: { mutations: [], queries: [] },
		}

		plugin.setup?.(useNuxtApp())

		expect(mocks.setQueryClientDehydrateState.mock.calls).toEqual([
			[useNuxtApp().vueApp, 'admin', state.value.admin],
			[useNuxtApp().vueApp, 'default', state.value.default],
		])
	})
})
