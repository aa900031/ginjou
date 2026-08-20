import type { Router, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { RouteDetail, RouteDetailLoaded } from 'svelte-spa-router'
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

export interface SpaRouterTerminalHandlers {
	onRouteLoaded: (detail: RouteDetailLoaded) => void
	onConditionsFailed: (detail: RouteDetail) => void
}

export type SpaRouter
	= & Router
		& Pick<Blocker, 'withBlocker'>
		& SpaRouterTerminalHandlers

export function createRouter(options?: CreateRouterOptions): SpaRouter {
	const parseQuery = options?.parseQuery ?? defaultParseQuery
	const stringifyQuery = options?.stringifyQuery ?? defaultStringifyQuery

	let stopBeforeUnload: (() => void) | undefined
	const blocker = createBlocker({
		parseQuery,
		onActive: (active) => {
			stopBeforeUnload?.()
			stopBeforeUnload = active ? addBeforeUnload(handleBeforeUnload) : undefined
		},
	})
	const getLocation = (): RouterLocation<any> =>
		blocker.acceptedLocation
		?? toLocation(router.location, router.querystring, router.params, parseQuery)

	onDestroy(blocker.dispose)

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
					handler(getLocation())
				})
			})
		},
		blocker: blocker.create,
		withBlocker: blocker.withBlocker,
		onRouteLoaded: blocker.settle,
		onConditionsFailed: blocker.abandon,
	})
	function handleBeforeUnload(event: BeforeUnloadEvent): void {
		const blocking = blocker.anyBlocking({
			currentLocation: getLocation(),
			nextLocation: undefined,
		})

		if (!blocking)
			return

		event.preventDefault()
		event.returnValue = true
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
