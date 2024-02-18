import type { SetRequired, Simplify } from 'type-fest'
import { watch } from 'vue-demi'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions } from 'vue-router'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import type { Router } from '@ginjou/core'
import { toLocation, toRouteLocation } from './location'

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

export function createRouterBinding(): Router<
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
		resolve: (params) => {
			const current = router.currentRoute.value
			const resolved = router.resolve(toRouteLocation(params, current))
			return resolved.href
		},
		getLocation: () => {
			return toLocation(router.currentRoute.value)
		},
		onChangeLocation: (handler) => {
			const stopWatch = watch(router.currentRoute, (val) => {
				handler(toLocation(val))
			})
			onBeforeRouteLeave(stopWatch)

			return stopWatch
		},
	}
}
