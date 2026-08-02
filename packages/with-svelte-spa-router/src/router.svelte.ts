import type { Router, RouterBlockerHandle, RouterBlockShouldFn, RouterBlockShouldInput, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { Blocker } from './blocker.svelte'
import type { QueryParser, QueryStringifier } from './location'
import { defineRouter } from '@ginjou/core'
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
		& Pick<Blocker, 'withBlocker'>

export function createRouter(options?: CreateRouterOptions): SpaRouter {
	const parseQuery = options?.parseQuery ?? defaultParseQuery
	const stringifyQuery = options?.stringifyQuery ?? defaultStringifyQuery
	const blocker = createBlocker({ parseQuery })

	// The blocker's accepted location, not the raw hash: the hash moves before a route
	// pre-condition runs, so while a navigation is held the hash points at a page that is not
	// mounted and `router.params` still belongs to the page that is. Falls back to the hash
	// until the first navigation is accepted, so a router without `withBlocker` is unaffected.
	//
	// This is why `withBlocker` takes the whole route table and the bare condition is not exposed:
	// a route reached without the condition never updates the accepted location, and every
	// consumer would be told about the route before it for as long as that route is mounted.
	const getLocation = (): RouterLocation<any> =>
		blocker.acceptedLocation
		?? toLocation(router.location, router.querystring, router.params, parseQuery)

	// Attached with the first blocker instead of up front: a registered `beforeunload` listener
	// makes the page ineligible for the back/forward cache, and an app that never blocks should
	// not pay for that.
	let stopBeforeUnload: (() => void) | undefined

	onDestroy(() => {
		stopBeforeUnload?.()
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
			stopBeforeUnload ??= addBeforeUnload(handleBeforeUnload)

			return {
				unregister: () => {
					blocker.remove(entry)

					if (blocker.entries.size === 0) {
						stopBeforeUnload?.()
						stopBeforeUnload = undefined
					}
				},
				proceed: () => entry.resolve?.(true),
				reset: () => entry.resolve?.(false),
			}
		},
	})

	return Object.assign(
		_router,
		{
			withBlocker: blocker.withBlocker,
		},
	)

	function handleBeforeUnload(event: BeforeUnloadEvent): void {
		const input: RouterBlockShouldInput = {
			currentLocation: getLocation(),
			nextLocation: undefined,
		}

		for (const entry of blocker.entries) {
			if (entry.shouldBlock(input)) {
				event.preventDefault()
				event.returnValue = true
				return
			}
		}
	}
}

function addBeforeUnload(handler: (event: BeforeUnloadEvent) => void) {
	if (typeof window === 'undefined')
		return () => {}

	window.addEventListener('beforeunload', handler)
	return () => {
		window.removeEventListener('beforeunload', handler)
	}
}
