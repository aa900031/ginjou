import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'
import type { RouterGoParams, RouterLocation } from '@ginjou/core'
import type { RouteGoMeta, RouteParsedMeta } from './router'

export function toRouteLocation(
	params: RouterGoParams<RouteGoMeta>,
	current: RouteLocationNormalizedLoaded,
): RouteLocationRaw {
	const {
		meta = {},
		to,
		type,
		query,
		hash,
		keepQuery,
		keepHash,
	} = params

	const {
		query: currentQuery,
		hash: currentHash,
	} = current

	const nextQuery = {
		...(keepQuery && currentQuery),
		...query,
	}

	const nextHash = `${(
		hash
		|| (keepHash && resolveHash(currentHash))
		|| ''
	)}`

	return JSON.parse(JSON.stringify({
		...meta,
		...('name' in meta)
			? {
					path: undefined,
					name: meta.name,
					params: meta.params,
				}
			: {
					path: to,
					name: undefined,
				},
		replace: !!(meta.replace ?? type === 'replace'),
		query: nextQuery,
		hash: nextHash || undefined,
	}))
}

export function toLocation(
	current: RouteLocationNormalizedLoaded,
): RouterLocation<RouteParsedMeta> {
	return {
		path: current.path,
		params: current.params,
		query: current.query,
		hash: current.hash,
		meta: {
			location: current,
		},
	}
}

function resolveHash(
	rawHash: string | undefined,
) {
	return rawHash?.replace(/^#/, '')
}
