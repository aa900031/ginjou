import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router'

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
