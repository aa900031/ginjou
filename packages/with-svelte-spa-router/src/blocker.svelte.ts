import type { RouterBlockerFn, RouterLocation } from '@ginjou/core'
import type { Component } from 'svelte'
import type { RouteDefinition, RouteDetail, RoutePrecondition, WrappedComponent } from 'svelte-spa-router'
import type { QueryParser } from './location'
import { RouteBlocker } from '@ginjou/core'
import { tick } from 'svelte'
import { replace } from 'svelte-spa-router'
import { wrap } from 'svelte-spa-router/wrap'
import { toLocation } from './location'

interface AcceptedNavigation {
	target: string
	location: RouterLocation
}

/**
 * Marks a history entry as one the user has already stood on.
 *
 * A fragment navigation always creates an entry whose state is `null`, so an entry carrying this
 * is one we have been on before, i.e. reached by going back or forward. Nothing else separates the
 * two: the browser reports a plain `location.hash` assignment and a Back press identically, down to
 * `popstate` with a null state, and `history.length` cannot tell either because a push truncates
 * the forward entries and comes out the same length.
 */
const VISITED = '__ginjou_visited'

function markVisited(): void {
	if (!isNewEntry())
		return

	// Merged, never replaced: svelte-spa-router keeps its scroll position on the same object.
	window.history.replaceState({ ...window.history.state, [VISITED]: true }, '')
}

/** Whether the entry the router just landed on was created by this navigation. */
function isNewEntry(): boolean {
	return window.history.state?.[VISITED] !== true
}

export interface CreateBlockerProps {
	parseQuery: QueryParser
	onActive?: RouteBlocker.CreateRegistryProps['onActive']
}

export interface Blocker {
	readonly acceptedLocation: RouterLocation | undefined
	create: RouterBlockerFn
	anyBlocking: RouteBlocker.Registry['anyBlocking']
	settle: () => void
	abandon: () => void
	dispose: () => void
	createBlockerCondition: () => RoutePrecondition
	withBlocker: <T extends RouteDefinition>(routes: T) => T
}

export function createBlocker(
	props: CreateBlockerProps,
): Blocker {
	const { parseQuery, onActive } = props
	const blockers = RouteBlocker.createRegistry({ onActive })

	/**
	 * Last navigation the blockers let through. A pre-condition is only told where the router
	 * is *going*, and `router.location` has already moved on by the time it runs, so the
	 * location being left has to be remembered here.
	 */
	let accepted = $state.raw<AcceptedNavigation | undefined>()

	/**
	 * The one before it.
	 *
	 * Approving is not reaching: this condition is asked before the caller's own, because the router
	 * unmounts the page on screen the moment any of them rejects and one with unsaved work has to be
	 * asked first. So `accepted` can name a route nothing ever mounted, and the route that was
	 * really the last one current has to be kept to go back to.
	 */
	let previous: AcceptedNavigation | undefined

	/** Sequence number of the last condition run, so a superseded run can recognise itself. */
	let runs = 0

	return {
		get acceptedLocation() {
			return accepted?.location
		},
		create: blockers.create,
		anyBlocking: blockers.anyBlocking,
		settle,
		abandon,
		dispose: blockers.dispose,
		createBlockerCondition,
		withBlocker: routes => withCondition(routes, createBlockerCondition()),
	}

	function settle(): void {
		previous = undefined
		blockers.settle()
	}

	function abandon(): void {
		if (previous != null) {
			accepted = previous
			previous = undefined
		}
		blockers.settle()
	}

	function accept(
		target: string,
		location: RouterLocation,
	): void {
		if (accepted?.target !== target) {
			previous = accepted
			accepted = { target, location }
		}
		markVisited()
	}

	function createBlockerCondition(): RoutePrecondition {
		return async function blockerCondition(detail: RouteDetail): Promise<boolean> {
			const target = toTarget(detail)
			const run = ++runs
			const pushed = isNewEntry()
			const location = toLocation(detail.location, detail.querystring, detail.params, parseQuery)

			if (accepted == null || accepted.target === target) {
				accept(target, location)
				return true
			}

			const proceeded = await blockers.run({
				currentLocation: accepted.location,
				nextLocation: location,
			})

			if (run !== runs)
				return false

			if (!proceeded) {
				await restore(accepted.target)

				if (pushed)
					window.history.back()

				return false
			}

			accept(target, location)
			return true
		}
	}
}

function withCondition<
	T extends RouteDefinition,
>(
	routes: T,
	condition: RoutePrecondition,
): T {
	const entry = (
		[path, component]: [string | RegExp, Component<any, any> | WrappedComponent],
	): [string | RegExp, WrappedComponent] => [path, wrapWithCondition(component, condition)]

	return (
		routes instanceof Map
			? new Map([...routes].map(entry))
			: Object.fromEntries(Object.entries(routes).map(entry))
	) as T
}

function wrapWithCondition(
	component: Component<any, any> | WrappedComponent,
	condition: RoutePrecondition,
): WrappedComponent {
	if (!isWrapped(component))
		return wrap({ component, conditions: condition })

	// First: the router unmounts whatever is on screen as soon as any condition answers false, so a
	// page with unsaved work has to be asked before the caller's own conditions get their say.
	return Object.defineProperty(
		{ ...component, conditions: [condition, ...component.conditions ?? []] },
		'_sveltesparouter',
		{ value: true },
	)
}

function isWrapped(
	value: Component<any, any> | WrappedComponent,
): value is WrappedComponent {
	return typeof value === 'object'
		&& value !== null
		&& (value as { _sveltesparouter?: boolean })._sveltesparouter === true
}

function toTarget(
	detail: RouteDetail,
): string {
	return detail.querystring
		? `${detail.location}?${detail.querystring}`
		: detail.location
}

async function restore(
	target: string,
): Promise<void> {
	await replace(target)
	await tick()
}
