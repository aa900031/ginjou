import type { RouterGoParams, RouterLocation } from '@ginjou/core'
import type { SetRequired, Simplify } from 'type-fest'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions } from 'vue-router'
import { defineRouter } from '@ginjou/core'
import { watch } from 'vue-demi'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
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

export function createRouter() {
	const router = useRouter()

	return defineRouter({
		go: (params: RouterGoParams<RouteGoMeta>): void => {
			const current = router.currentRoute.value
			const location = toRouteLocation(params, current)

			router.push(location)
		},
		back: (): void => {
			router.back()
		},
		resolve: (params: RouterGoParams<RouteGoMeta>) => {
			const current = router.currentRoute.value
			const resolved = router.resolve(toRouteLocation(params, current))
			return resolved.href
		},
		getLocation: (): RouterLocation<RouteParsedMeta> => {
			return toLocation(router.currentRoute.value)
		},
		onChangeLocation: (handler) => {
			const stopWatch = watch(router.currentRoute, (val) => {
				handler(toLocation(val))
			})
			onBeforeRouteLeave(stopWatch)

			return stopWatch
		},
	})
}
