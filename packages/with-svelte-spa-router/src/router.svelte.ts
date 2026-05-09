import type { Router, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { QueryParser, QueryStringifier } from './location'
import { defineRouter } from '@ginjou/core'
import { pop, push, replace, router } from 'svelte-spa-router'
import { buildPath, defaultParseQuery, defaultStringifyQuery, toLocation } from './location'

export interface CreateRouterOptions {
	parseQuery?: QueryParser
	stringifyQuery?: QueryStringifier
}

export function createRouter(options?: CreateRouterOptions): Router {
	const parseQuery = options?.parseQuery ?? defaultParseQuery
	const stringifyQuery = options?.stringifyQuery ?? defaultStringifyQuery

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
		getLocation: () => {
			return toLocation(router.location, router.querystring, router.params, parseQuery)
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
