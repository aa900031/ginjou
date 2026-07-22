import { dehydrate, QueryClient } from '@tanstack/vue-query'
import { describe, expect, it } from 'vitest'
import { getCurrentInstance } from 'vue-demi'
import { mountSetup } from '../../test/mount'
import { defineQueryClientContext, getQueryClients, setQueryClientDehydrateState } from './query-client'

describe('query-client global pollution', () => {
	// Two apps = two concurrent SSR requests sharing the same module.
	// getQueryClients() must return only the client of the app it is asked about,
	// otherwise request A dehydrates request B's data -> cross-request leak.
	it('isolates query clients per app', () => {
		const clientA = new QueryClient()
		const clientB = new QueryClient()

		const a = mountSetup(() => {
			defineQueryClientContext(clientA)
			return getCurrentInstance()!.appContext.app
		})
		const b = mountSetup(() => {
			defineQueryClientContext(clientB)
			return getCurrentInstance()!.appContext.app
		})

		// Queried after both apps mount, exactly like the Nuxt app:rendered hook.
		// Reference identity, not structural: two empty QueryClients are deeply equal.
		const clientsA = [...getQueryClients(a.result).values()]
		const clientsB = [...getQueryClients(b.result).values()]
		expect(clientsA).toHaveLength(1)
		expect(clientsA[0]).toBe(clientA)
		expect(clientsB).toHaveLength(1)
		expect(clientsB[0]).toBe(clientB)
	})

	it('does not leak dehydrated state across apps', () => {
		// Server request A produces dehydrated state keyed by useId().
		const server = new QueryClient()
		server.setQueryData(['ping'], 'pong')
		const a1 = mountSetup(() => {
			defineQueryClientContext(server)
			return getCurrentInstance()!.appContext.app
		})
		const dehydrated = [...getQueryClients(a1.result)].map(([key, client]) => [key, dehydrate(client)] as const)
		expect(dehydrated).toHaveLength(1)

		// Client request A: seed then mount -> hydrates (useId key matches server).
		const clientA = new QueryClient()
		mountSetup(() => {
			const app = getCurrentInstance()!.appContext.app
			for (const [key, state] of dehydrated)
				setQueryClientDehydrateState(app, key, state)
			defineQueryClientContext(clientA)
			return app
		})
		expect(clientA.getQueryData(['ping'])).toBe('pong')

		// Client request B: never seeded -> must stay clean.
		const clientB = new QueryClient()
		mountSetup(() => {
			defineQueryClientContext(clientB)
			return getCurrentInstance()!.appContext.app
		})
		expect(clientB.getQueryData(['ping'])).toBeUndefined()
	})
})
