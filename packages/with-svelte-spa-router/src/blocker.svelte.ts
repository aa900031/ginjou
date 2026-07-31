import type { RouterBlockShouldFn, RouterLocation } from '@ginjou/core'
import type { Component } from 'svelte'
import type { RouteDefinition, RouteDetail, RoutePrecondition, WrappedComponent } from 'svelte-spa-router'
import type { QueryParser } from './location'
import { RouteBlocker, RouterBlockerAction } from '@ginjou/core'
import { tick } from 'svelte'
import { replace } from 'svelte-spa-router'
import { wrap } from 'svelte-spa-router/wrap'
import { toLocation } from './location'

interface AcceptedNavigation {
	target: string
	location: RouterLocation
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

	function createBlockerCondition(): RoutePrecondition {
		return async function blockerCondition(detail: RouteDetail): Promise<boolean> {
			const target = toTarget(detail)

			// Already settled: the restore below, a navigation to the location we are already on,
			// or a second copy of this condition on the same route.
			if (accepted?.target === target)
				return true

			const location = toLocation(detail.location, detail.querystring, detail.params, parseQuery)

			// First navigation of the session, there is nothing to leave yet.
			if (accepted == null) {
				accepted = { target, location }
				return true
			}

			// ponytail: svelte-spa-router only reports hash changes, so push/pop/replace cannot be
			// told apart. Add popstate sniffing if a blocker ever needs the real action.
			const proceeded = await RouteBlocker.checkEntries(entries, {
				currentLocation: accepted.location,
				nextLocation: location,
				action: RouterBlockerAction.Push,
			})
			if (!proceeded) {
				await restore(accepted.target)
				return false
			}

			accepted = { target, location }
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

	// Copied rather than mutated: `routes` belongs to the caller, and wrapping the same table
	// twice must not stack conditions. The `_sveltesparouter` marker `wrap()` sets is
	// non-enumerable, so a spread alone would drop it and the router would reject the route.
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
	// `replace` dispatches `hashchange` synchronously, so this lets the router restart its
	// route effect for the restored location before the blocked run resumes. That marks the
	// blocked run as cancelled, which is what stops it from unmounting the current component
	// and throwing away the very state the blocker is protecting.
	await tick()
}
