import type { Router, RouterBlockerHandle, RouterBlockShouldFn, RouterBlockShouldInput, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { Blocker } from './blocker.svelte'
import type { QueryParser, QueryStringifier } from './location'
import { defineRouter, RouterBlockerAction } from '@ginjou/core'
import { onDestroy } from 'svelte'
import { pop, push, replace, router } from 'svelte-spa-router'
import { createBlocker } from './blocker.svelte'
import { buildPath, defaultParseQuery, defaultStringifyQuery, toLocation } from './location'

export interface CreateRouterOptions {
	parseQuery?: QueryParser
	stringifyQuery?: QueryStringifier
}

export type SpaRouter
	= & Router
		& Pick<Blocker, 'createBlockerCondition' | 'withBlocker'>

export function createRouter(options?: CreateRouterOptions): SpaRouter {
	const parseQuery = options?.parseQuery ?? defaultParseQuery
	const stringifyQuery = options?.stringifyQuery ?? defaultStringifyQuery
	const blocker = createBlocker({ parseQuery })

	// The blocker's accepted location, not the raw hash: the hash moves before a route
	// pre-condition runs, so while a navigation is held the hash points at a page that is not
	// mounted and `router.params` still belongs to the page that is. Falls back to the hash
	// until the first navigation is accepted, so a router without `withBlocker` is unaffected.
	const getLocation = (): RouterLocation<any> =>
		blocker.acceptedLocation
		?? toLocation(router.location, router.querystring, router.params, parseQuery)

	const stopBeforeUnload = addBeforeUnload((event) => {
		const input: RouterBlockShouldInput = {
			currentLocation: getLocation(),
			nextLocation: undefined,
			action: RouterBlockerAction.Unload,
		}

		for (const entry of blocker.entries) {
			if (entry.shouldBlock(input)) {
				event.preventDefault()
				event.returnValue = true
				return
			}
		}
	})

	onDestroy(() => {
		stopBeforeUnload()
		blocker.clear()
	})

	const _router = defineRouter({
		go: (params: RouterGoParams): void => {
			const path = buildPath(params, router.location, router.querystring, parseQuery, stringifyQuery)
			if (params.type === 'replace')
				replace(path)
			else
				push(path)
		},
		back: (): void => {
			pop()
		},
		resolve: (params: RouterGoParams): string => {
			return buildPath(params, router.location, router.querystring, parseQuery, stringifyQuery)
		},
		getLocation,
		onChangeLocation: (handler: (location: RouterLocation<any>) => void) => {
			return $effect.root(() => {
				$effect(() => {
					handler(getLocation())
				})
			})
		},
		blocker: (shouldBlock: RouterBlockShouldFn): RouterBlockerHandle => {
			const entry = blocker.add(shouldBlock)

			return {
				unregister: () => blocker.remove(entry),
				proceed: () => entry.resolve?.(true),
				reset: () => entry.resolve?.(false),
			}
		},
	})

	return Object.assign(
		_router,
		{
			createBlockerCondition: blocker.createBlockerCondition,
			withBlocker: blocker.withBlocker,
		},
	)
}

function addBeforeUnload(handler: (event: BeforeUnloadEvent) => void) {
	if (typeof window === 'undefined')
		return () => {}

	window.addEventListener('beforeunload', handler)
	return () => {
		window.removeEventListener('beforeunload', handler)
	}
}
