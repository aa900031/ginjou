import type { RouterGoParams, RouterLocation } from '@ginjou/core'
import type { SetRequired, Simplify } from 'type-fest'
import type { LocationAsRelativeRaw, RouteLocationNormalizedLoaded, RouteLocationOptions } from 'vue-router'
import { defineRouter, RouteBlocker } from '@ginjou/core'
import { getCurrentInstance, onActivated, onDeactivated, onScopeDispose, watch } from 'vue-demi'
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

	// Every way a navigation can end: `afterEach` covers success, and every failure vue-router
	// reports as one — cancelled, aborted, duplicated — while a guard or async component that
	// throws only ever reaches `onError`. Either way the blockers that approved it are done.
	const stopAfterEach = router.afterEach(() => {
		blockers.settle()
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
			assertComponentInstance('onChangeLocation')

			const notify = (): void => handler(toLocation(router.currentRoute.value))

			let leftFrom: RouteLocationNormalizedLoaded | undefined

			onBeforeRouteLeave((_to, from) => {
				leftFrom = from
			})
			onActivated(() => {
				if (leftFrom == null)
					return

				leftFrom = undefined
				notify()
			})

			return watch(router.currentRoute, (route) => {
				if (leftFrom != null && route.path !== leftFrom.path)
					return

				leftFrom = undefined
				notify()
			})
		},
		blocker: (shouldBlock) => {
			assertComponentInstance('blocker')

			let cached = false
			onDeactivated(() => {
				cached = true
			})
			onActivated(() => {
				cached = false
			})

			return blockers.create(input => !cached && shouldBlock(input))
		},
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

function assertComponentInstance(
	name: string,
): void {
	if (getCurrentInstance() == null)
		throw new Error(`[@ginjou/with-vue-router] \`${name}\` binds component lifecycle hooks, so it has to be called during a component's setup.`)
}

function addBeforeUnload(handler: (event: BeforeUnloadEvent) => void) {
	if (typeof window === 'undefined')
		return () => {}

	window.addEventListener('beforeunload', handler)
	return () => {
		window.removeEventListener('beforeunload', handler)
	}
}
