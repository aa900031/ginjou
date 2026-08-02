import type { RouterBlockerHandle, RouterBlockShouldFn, RouterBlockShouldInput, RouterGoParams, RouterLocation } from '@ginjou/core'
import type { SetRequired, Simplify } from 'type-fest'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions } from 'vue-router'
import { defineRouter, RouteBlocker } from '@ginjou/core'
import { onActivated, onDeactivated, onScopeDispose, watch } from 'vue-demi'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { toLocation, toRouteLocation } from './location'
import { isChangingRoute } from './utils/route-record'

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

// eslint-disable-next-line ts/explicit-function-return-type
export function createRouter() {
	const router = useRouter()
	const blockerEntries = new Set<RouteBlocker.Entry>()
	const getLocation = (): RouterLocation<RouteParsedMeta> => toLocation(router.currentRoute.value)

	const stopBeforeEach = router.beforeEach((to, from) => {
		if (blockerEntries.size === 0 || !isChangingRoute(to, from))
			return true

		return RouteBlocker.checkEntries(blockerEntries, {
			currentLocation: toLocation(from),
			nextLocation: toLocation(to as RouteLocationNormalizedLoaded),
		})
	})

	let stopBeforeUnload: (() => void) | undefined

	// One listener for the whole router rather than one per subscription: `onChangeLocation`
	// callers are not obliged to call the teardown it returns, so a per-subscription guard would
	// outlive every component that ever used `useLocation`.
	const mutedSubscriptions = new Set<() => void>()
	const stopAfterEach = router.afterEach((_to, _from, failure) => {
		if (failure != null)
			mutedSubscriptions.forEach(unmute => unmute())
	})

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
			let muted = false
			let cached = false
			const notify = (): void => handler(toLocation(router.currentRoute.value))

			// Only while the component is still where it was. Once it has been deactivated the
			// leave committed, and a later navigation failing elsewhere in the app says nothing
			// about this subscription.
			const unmuteOnFailure = (): void => {
				if (!cached)
					muted = false
			}

			onBeforeRouteLeave(() => {
				muted = true
			})
			onDeactivated(() => {
				cached = true
			})
			onActivated(() => {
				cached = false
				if (!muted)
					return

				muted = false
				notify()
			})
			onScopeDispose(() => {
				mutedSubscriptions.delete(unmuteOnFailure)
			})

			mutedSubscriptions.add(unmuteOnFailure)

			const stopWatch = watch(router.currentRoute, () => {
				if (!muted)
					notify()
			})

			return () => {
				mutedSubscriptions.delete(unmuteOnFailure)
				stopWatch()
			}
		},
		blocker: (shouldBlock: RouterBlockShouldFn): RouterBlockerHandle => {
			const entry: RouteBlocker.Entry = { shouldBlock }
			blockerEntries.add(entry)
			stopBeforeUnload ??= addBeforeUnload(handleBeforeUnload)

			return {
				unregister: () => {
					blockerEntries.delete(entry)
					entry.resolve?.(true)

					if (blockerEntries.size === 0) {
						stopBeforeUnload?.()
						stopBeforeUnload = undefined
					}
				},
				proceed: () => entry.resolve?.(true),
				reset: () => entry.resolve?.(false),
			}
		},
	})

	function handleBeforeUnload(event: BeforeUnloadEvent): void {
		const input: RouterBlockShouldInput = {
			currentLocation: getLocation(),
			nextLocation: undefined,
		}

		for (const entry of blockerEntries) {
			if (entry.shouldBlock(input)) {
				event.preventDefault()
				event.returnValue = true
				return
			}
		}
	}

	function cleanup(): void {
		stopBeforeEach()
		stopAfterEach()
		stopBeforeUnload?.()

		blockerEntries.forEach(entry => entry.resolve?.(true))
		blockerEntries.clear()
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
