import type { SetRequired, Simplify } from 'type-fest'
import { watch } from 'vue'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions, RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import type { Router, RouterGoParams, RouterParsedValue } from '@ginjou/router'

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
			return toParsedValue(router.currentRoute.value)
		},
		onCurrentChange: (handler) => {
			return watch(router.currentRoute, (val) => {
				handler(toParsedValue(val))
			})
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

function toParsedValue(
	current: RouteLocationNormalizedLoaded,
): RouterParsedValue<RouteParsedMeta> {
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
