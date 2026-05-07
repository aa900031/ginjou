import type { Router, RouterGoParams, RouterLocation } from '@ginjou/core'
import { defineRouter } from '@ginjou/core'

const ORIGIN = 'https://storybook.local'

export function createMockRouter(initialPath = '/'): Router {
	let location = toLocation(initialPath)
	const history: RouterLocation[] = [location]
	const listeners = new Set<(value: RouterLocation) => void>()

	return defineRouter({
		go(params) {
			const next = applyGo(location, params)
			if (params.type === 'replace')
				history[history.length - 1] = next
			else
				history.push(next)

			location = next
			notify()
		},
		back() {
			if (history.length <= 1)
				return

			history.pop()
			location = history[history.length - 1]!
			notify()
		},
		resolve(params) {
			return toHref(applyGo(location, params))
		},
		getLocation() {
			return location
		},
		onChangeLocation(handler) {
			listeners.add(handler)
			return () => {
				listeners.delete(handler)
			}
		},
	})

	function notify(): void {
		for (const listener of listeners)
			listener(location)
	}
}

export function formatLocation(location: RouterLocation | undefined): string {
	if (!location)
		return '/'

	return toHref(location)
}

function applyGo(current: RouterLocation, params: RouterGoParams): RouterLocation {
	const target = params.to == null
		? cloneLocation(current)
		: toLocation(params.to)
	const queryBase = params.keepQuery && params.to != null
		? mergeQuery(current.query, undefined)
		: mergeQuery(target.query, undefined)
	const query = mergeQuery(queryBase, params.query)

	return {
		path: target.path,
		query: Object.keys(query ?? {}).length > 0 ? query : undefined,
		hash: params.hash != null
			? normalizeHash(params.hash)
			: params.keepHash
				? current.hash
				: target.hash,
		meta: params.meta ?? target.meta,
	}
}

function mergeQuery(
	base: RouterLocation['query'],
	patch: RouterGoParams['query'],
): RouterLocation['query'] {
	const query = { ...(base ?? {}) }

	for (const [key, value] of Object.entries(patch ?? {})) {
		if (value == null)
			delete query[key]
		else
			query[key] = `${value}`
	}

	return query
}

function toLocation(value: string): RouterLocation {
	const url = new URL(value, ORIGIN)
	const query = parseQuery(url.searchParams)

	return {
		path: url.pathname,
		query: Object.keys(query).length > 0 ? query : undefined,
		hash: url.hash || undefined,
	}
}

function toHref(location: RouterLocation): string {
	const url = new URL(location.path, ORIGIN)

	for (const [key, value] of Object.entries(location.query ?? {})) {
		if (Array.isArray(value)) {
			for (const item of value)
				url.searchParams.append(key, item ?? '')
			continue
		}

		url.searchParams.set(key, value ?? '')
	}

	if (location.hash)
		url.hash = normalizeHash(location.hash)

	return `${url.pathname}${url.search}${url.hash}`
}

function parseQuery(searchParams: URLSearchParams): NonNullable<RouterLocation['query']> {
	const query: NonNullable<RouterLocation['query']> = {}

	for (const [key, value] of searchParams.entries()) {
		const existing = query[key]
		if (existing == null) {
			query[key] = value
			continue
		}

		if (Array.isArray(existing)) {
			existing.push(value)
			continue
		}

		query[key] = [existing, value]
	}

	return query
}

function cloneLocation(location: RouterLocation): RouterLocation {
	return {
		path: location.path,
		query: mergeQuery(location.query, undefined),
		hash: location.hash,
		meta: location.meta,
	}
}

function normalizeHash(hash: string): string {
	return hash.startsWith('#') ? hash : `#${hash}`
}
