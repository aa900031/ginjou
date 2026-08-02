import type { RouterBlockShouldFn, RouterLocation } from '@ginjou/core'
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
	if (window.history.state?.[VISITED] === true)
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
}

export interface Blocker {
	readonly acceptedLocation: RouterLocation | undefined
	entries: ReadonlySet<RouteBlocker.Entry>
	add: (shouldBlock: RouterBlockShouldFn) => RouteBlocker.Entry
	remove: (entry: RouteBlocker.Entry) => void
	clear: () => void
	createBlockerCondition: () => RoutePrecondition
	withBlocker: <T extends RouteDefinition>(routes: T) => T
}

export function createBlocker(
	props: CreateBlockerProps,
): Blocker {
	const { parseQuery } = props
	const entries = new Set<RouteBlocker.Entry>()

	/**
	 * Last navigation the blockers let through. A pre-condition is only told where the router
	 * is *going*, and `router.location` has already moved on by the time it runs, so the
	 * location being left has to be remembered here.
	 */
	let accepted = $state.raw<AcceptedNavigation | undefined>()

	/** Sequence number of the last condition run, so a superseded run can recognise itself. */
	let runs = 0

	return {
		get acceptedLocation() {
			return accepted?.location
		},
		entries,
		add: (shouldBlock) => {
			const entry: RouteBlocker.Entry = { shouldBlock }
			entries.add(entry)
			return entry
		},
		remove,
		clear: () => {
			entries.forEach(remove)
		},
		createBlockerCondition,
		withBlocker: routes => withCondition(routes, createBlockerCondition()),
	}

	function remove(
		entry: RouteBlocker.Entry,
	): void {
		entries.delete(entry)
		entry.resolve?.(true)
	}

	function accept(
		target: string,
		location: RouterLocation,
	): void {
		accepted = { target, location }
		markVisited()
	}

	function createBlockerCondition(): RoutePrecondition {
		return async function blockerCondition(detail: RouteDetail): Promise<boolean> {
			const target = toTarget(detail)
			const run = ++runs
			// Read before anything is awaited: `restore` rewrites the entry we are standing on.
			const pushed = isNewEntry()

			// Already settled: the restore below, a navigation to the location we are already on,
			// or a second copy of this condition on the same route.
			if (accepted?.target === target) {
				markVisited()
				return true
			}

			const location = toLocation(detail.location, detail.querystring, detail.params, parseQuery)

			// First navigation of the session, there is nothing to leave yet.
			if (accepted == null) {
				accept(target, location)
				return true
			}

			if (accepted.location.path === location.path) {
				accept(target, location)
				return true
			}

			const proceeded = await RouteBlocker.checkEntries(entries, {
				currentLocation: accepted.location,
				nextLocation: location,
			})

			// A newer navigation took the hold over while this one was held. It owns the URL now, so
			// restoring it here would fight it, and the router has already dropped this run, so
			// becoming `accepted` here would report a route that is not mounted.
			if (run !== runs)
				return false

			if (!proceeded) {
				await restore(accepted.target)

				// The cancelled push left its entry behind, now holding a copy of the location we
				// just restored. Stepping off it puts Back where the user expects, and the entry it
				// steps onto is the one we came from, so the hash does not change: `popstate` fires
				// without `hashchange` and the router never sees it. Skipped for a cancelled
				// traversal, where nothing was created and going back would leave the page.
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

	// Prepended: the router stops at the first condition that answers false and unmounts whatever
	// is on screen, so anything running before the blocker can throw away unsaved work without it
	// ever asking. Going last would keep `accepted` from being committed for a route the caller's
	// own conditions then reject, but a stale reported location is the cheaper of the two.
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

/**
 * Puts the URL back where the still-mounted page is.
 *
 * Overwrites the entry the router landed on rather than undoing the traversal, because the
 * synchronous `hashchange` `replace` dispatches is what restarts the route effect and marks the
 * blocked run as cancelled — without it the router unmounts the page it is protecting. The caller
 * steps off the leftover entry afterwards when the navigation was a push.
 *
 * ponytail: a cancelled Back still overwrites the entry the user came back to, and that one cannot
 * be recovered — undoing it needs a forward step, which is outside svelte-spa-router's API.
 */
async function restore(
	target: string,
): Promise<void> {
	await replace(target)
	// `replace` dispatches `hashchange` synchronously, so this lets the router restart its route
	// effect for the restored location before the blocked run resumes. That marks the blocked run
	// as cancelled, which is what stops it from unmounting the current component and throwing away
	// the very state the blocker is protecting.
	await tick()
}
