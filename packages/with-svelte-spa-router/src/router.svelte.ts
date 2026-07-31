import type { Router, RouterBlockerHandle, RouterBlockShouldFn, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { QueryParser, QueryStringifier } from './location'
import { defineRouter, RouterBlockerAction } from '@ginjou/core'
import { onDestroy } from 'svelte'
import { pop, push, replace, router } from 'svelte-spa-router'
import { buildPath, defaultParseQuery, defaultStringifyQuery, toLocation } from './location'

export interface CreateRouterOptions {
	parseQuery?: QueryParser
	stringifyQuery?: QueryStringifier
}

export function createRouter(options?: CreateRouterOptions): Router {
	const parseQuery = options?.parseQuery ?? defaultParseQuery
	const stringifyQuery = options?.stringifyQuery ?? defaultStringifyQuery
	const shouldBlocks = new Set<RouterBlockShouldFn>()

	const getLocation = (): RouterLocation<any> =>
		toLocation(router.location, router.querystring, router.params, parseQuery)

	const stopBeforeUnload = addBeforeUnload((event) => {
		const context = {
			currentLocation: getLocation(),
			nextLocation: undefined,
			action: RouterBlockerAction.Unload,
		}

		for (const shouldBlock of shouldBlocks) {
			if (shouldBlock(context)) {
				event.preventDefault()
				event.returnValue = true
				return
			}
		}
	})

	onDestroy(() => {
		stopBeforeUnload()
		shouldBlocks.clear()
	})

	return defineRouter({
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
					handler(toLocation(router.location, router.querystring, router.params, parseQuery))
				})
			})
		},
		blocker: (shouldBlock: RouterBlockShouldFn): RouterBlockerHandle => {
			const entry: RouterBlockShouldFn = context => shouldBlock(context)
			shouldBlocks.add(entry)

			return {
				unregister: () => {
					shouldBlocks.delete(entry)
				},
				proceed: () => {},
				reset: () => {},
			}
		},
	})
}

function addBeforeUnload(handler: (event: BeforeUnloadEvent) => void) {
	if (typeof window === 'undefined')
		return () => {}

	window.addEventListener('beforeunload', handler)
	return () => {
		window.removeEventListener('beforeunload', handler)
	}
}
