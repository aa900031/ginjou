import type { RouteLocationNormalized, RouteParams, RouteRecordNormalized } from 'vue-router'

/**
 * Reimplementation of vue-router's internal `isSameRouteRecord`, which is not publicly exported.
 *
 * An alias record counts as the record it aliases, so navigating between a record and its alias
 * is not a change of record.
 *
 * @see https://github.com/vuejs/router `isSameRouteRecord`
 */
export function isSameRouteRecord(
	a: RouteRecordNormalized,
	b: RouteRecordNormalized,
): boolean {
	return (a.aliasOf ?? a) === (b.aliasOf ?? b)
}

/**
 * Whether a navigation actually leaves the current route record, i.e. whether vue-router's
 * internal `extractChangingRecords` would produce a non-empty `leavingRecords` list.
 *
 * `matched` is a root-to-leaf ancestor chain, so if the leaf is still matched by `to`, all of its
 * ancestors are too — comparing the leaf alone is enough.
 *
 * `from` being `START_LOCATION` means `from.matched` is empty and nothing can be leaving.
 */
export function isLeavingRoute(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
): boolean {
	const leaf = from.matched[from.matched.length - 1]
	if (leaf == null)
		return false

	return !to.matched.some(record => isSameRouteRecord(record, leaf))
}

/**
 * Whether a navigation changes the route the mounted component is bound to, i.e. whether the
 * blockers have to be consulted.
 *
 * Leaving the record is not enough on its own: `/posts/1/edit -> /posts/2/edit` keeps the same
 * record, so vue-router reuses the component while everything derived from the id refetches and
 * rehydrates the form over the unsaved edits. Query-only changes touch neither and are excluded.
 */
export function isChangingRoute(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
): boolean {
	// `START_LOCATION`: there is no mounted route to change away from.
	if (from.matched.length === 0)
		return false

	return isLeavingRoute(to, from) || !keepsRouteParams(to, from)
}

function keepsRouteParams(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
): boolean {
	// The union of both sides, so a param the destination adds counts too: `/posts -> /posts/1` on
	// the same record refetches on the new id just like a change of id would.
	// Exempt when the destination entered a child record — `matched` is a root-to-leaf chain and the
	// leaf is still matched here, so a longer chain means new records, and the params they bring
	// belong to them rather than to the record the component is bound to.
	const keys = to.matched.length > from.matched.length
		? Object.keys(from.params)
		: new Set([...Object.keys(from.params), ...Object.keys(to.params)])

	for (const key of keys) {
		if (!isSameParamValue(to.params[key], from.params[key]))
			return false
	}

	return true
}

function isSameParamValue(
	a: RouteParams[string] | undefined,
	b: RouteParams[string] | undefined,
): boolean {
	return JSON.stringify(a) === JSON.stringify(b)
}
