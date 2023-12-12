import type { SetRequired, Simplify } from 'type-fest'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions, RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import type { Router, RouterGoParams } from '@ginjou/router'

export type RouteGoMeta = Simplify<
	| RouteLocationOptions
	| (
		RouteLocationOptions
		& SetRequired<LocationAsRelativeRaw, 'name'>
	)
>

export interface RouteParsedMeta {
	location: RouteLocationNormalizedLoaded
}

export function defineRouterBinding(): Router<
	RouteGoMeta,
	RouteParsedMeta
> {
	const router = useRouter()

	return {
		go: (params) => {
			const current = router.currentRoute.value
			const location = toRouteLocation(params, current)

			router.push(location)
		},
		back: () => {
			router.back()
		},
		getCurrent: () => {
			const current = router.currentRoute.value

			return {
				path: current.path,
				params: current.params,
				query: current.query,
				hash: current.hash,
				meta: {
					location: current,
				},
			}
		},
	}
}

function toRouteLocation(
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

	const nextHash = `#${(
		hash
		|| (keepHash && currentHash)
		|| ''
	).replace(/^#/, '')}`

	return {
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
		hash: nextHash,
	}
}
