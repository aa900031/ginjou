import type { RouterGoParams, RouterLocation } from '@ginjou/core'
import type { SetRequired, Simplify } from 'type-fest'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions } from 'vue-router'
import { defineRouter, RouteBlocker } from '@ginjou/core'
import { onActivated, onDeactivated, onScopeDispose, watch } from 'vue-demi'
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

// eslint-disable-next-line ts/explicit-function-return-type
export function createRouter() {
	const router = useRouter()
	const getLocation = (): RouterLocation<RouteParsedMeta> => toLocation(router.currentRoute.value)

	// Attached with the first blocker instead of up front: a registered `beforeunload` listener
	// makes the page ineligible for the back/forward cache, and an app that never blocks should
	// not pay for that.
	let stopBeforeUnload: (() => void) | undefined
	const blockers = RouteBlocker.createRegistry({
		onActive: (active) => {
			stopBeforeUnload?.()
			stopBeforeUnload = active ? addBeforeUnload(handleBeforeUnload) : undefined
		},
	})

	// Every navigation vue-router reports, with nothing filtered out on the way in. Which of them
	// are worth blocking is the page's call — `shouldBlock` is asked and gets both locations.
	const stopBeforeEach = router.beforeEach((to, from) => blockers.run({
		currentLocation: toLocation(from),
		nextLocation: toLocation(to as RouteLocationNormalizedLoaded),
	}))

	// One listener for the whole router rather than one per subscription: `onChangeLocation`
	// callers are not obliged to call the teardown it returns, so a per-subscription guard would
	// outlive every component that ever used `useLocation`.
	const mutedSubscriptions = new Set<() => void>()

	// Every way a navigation can end: `afterEach` covers success, and every failure vue-router
	// reports as one — cancelled, aborted, duplicated — while a guard or async component that
	// throws only ever reaches `onError`. Either way the blockers that approved it are done.
	const stopAfterEach = router.afterEach((_to, _from, failure) => {
		blockers.settle()

		if (failure != null)
			mutedSubscriptions.forEach(unmute => unmute())
	})
	const stopOnError = router.onError(() => {
		blockers.settle()
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
		blocker: blockers.create,
	})

	/**
	 * An unload is not a navigation the router can hold, so this only ever asks the predicates:
	 * there is nothing to proceed or reset, the browser decides.
	 */
	function handleBeforeUnload(event: BeforeUnloadEvent): void {
		const blocking = blockers.anyBlocking({
			currentLocation: getLocation(),
			nextLocation: undefined,
		})

		if (!blocking)
			return

		event.preventDefault()
		event.returnValue = true
	}

	function cleanup(): void {
		stopBeforeEach()
		stopAfterEach()
		stopOnError()
		blockers.dispose()
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
