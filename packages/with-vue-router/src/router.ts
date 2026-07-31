import type { RouterBlockerHandle, RouterBlockShouldFn, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { SetRequired, Simplify } from 'type-fest'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions } from 'vue-router'
import { defineRouter, RouterBlockerAction } from '@ginjou/core'
import { onScopeDispose, onUnmounted, watch } from 'vue-demi'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { toLocation, toRouteLocation } from './location'
import { isLeavingRoute } from './utils/route-record'

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

interface BlockerEntry {
	shouldBlock: RouterBlockShouldFn
	resolve?: (value: boolean) => void
}

// eslint-disable-next-line ts/explicit-function-return-type
export function createRouter() {
	const router = useRouter()
	const blockerEntries = new Set<BlockerEntry>()
	const getLocation = (): RouterLocation<RouteParsedMeta> => toLocation(router.currentRoute.value)

	const stopBeforeEach = router.beforeEach(async (to, from) => {
		if (!isLeavingRoute(to, from))
			return true

		const context = {
			currentLocation: toLocation(from),
			nextLocation: toLocation(to as RouteLocationNormalizedLoaded),
			action: RouterBlockerAction.Push,
		}

		for (const entry of [...blockerEntries]) {
			if (!entry.shouldBlock(context))
				continue

			const proceed = await new Promise<boolean>((resolve) => {
				entry.resolve?.(false)
				entry.resolve = resolve
			})
			entry.resolve = undefined

			if (!proceed)
				return false
		}

		return true
	})

	const stopBeforeUnload = addBeforeUnload((event) => {
		const context = {
			currentLocation: getLocation(),
			nextLocation: undefined,
			action: RouterBlockerAction.Unload,
		}

		for (const entry of blockerEntries) {
			if (entry.shouldBlock(context)) {
				event.preventDefault()
				event.returnValue = true
				return
			}
		}
	})

	onUnmounted(cleanup)
	onScopeDispose(cleanup)

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
		getLocation,
		onChangeLocation: (handler) => {
			const stopWatch = watch(router.currentRoute, (val) => {
				handler(toLocation(val))
			})
			onBeforeRouteLeave(stopWatch)

			return stopWatch
		},
		blocker: (shouldBlock: RouterBlockShouldFn): RouterBlockerHandle => {
			const entry: BlockerEntry = { shouldBlock }
			blockerEntries.add(entry)

			return {
				unregister: () => {
					blockerEntries.delete(entry)
					entry.resolve?.(true)
				},
				proceed: () => entry.resolve?.(true),
				reset: () => entry.resolve?.(false),
			}
		},
	})

	function cleanup(): void {
		stopBeforeEach()
		stopBeforeUnload()
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
