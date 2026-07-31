import type { Router, RouterBlockerHandle, RouterBlockShouldFn, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { QueryParser, QueryStringifier } from './location'
import { defineRouter, RouterBlockerAction } from '@ginjou/core'
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
	let warned = false

	const getLocation = (): RouterLocation<any> => toLocation(router.location, router.querystring, router.params, parseQuery)

	if (typeof window !== 'undefined') {
		window.addEventListener('beforeunload', (event) => {
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
	}

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
		blocker: (shouldBlock: RouterBlockShouldFn): RouterBlockerHandle => {
			// eslint-disable-next-line node/prefer-global/process -- replaced by bundlers, not a node runtime read
			if (process.env.NODE_ENV !== 'production' && !warned) {
				warned = true
				console.warn('[@ginjou/with-svelte-spa-router] `svelte-spa-router` has no before-navigation hook, so this provider can only trigger the browser\'s native warning when closing or reloading the tab. In-app navigation cannot be blocked.')
			}

			// Wrapped so registering the same function twice yields two independent handles.
			const entry: RouterBlockShouldFn = context => shouldBlock(context)
			shouldBlocks.add(entry)

			return {
				unregister: () => {
					shouldBlocks.delete(entry)
				},
				// `beforeunload` is decided synchronously, there is nothing to resume or cancel.
				proceed: () => {},
				reset: () => {},
			}
		},
		onChangeLocation: (handler: (location: RouterLocation<any>) => void) => {
			return $effect.root(() => {
				$effect(() => {
					handler(toLocation(router.location, router.querystring, router.params, parseQuery))
				})
			})
		},
	})
}
