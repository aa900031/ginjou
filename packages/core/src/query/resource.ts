import type { QueryKey } from '@tanstack/query-core'

/**
 * @deprecated
 */
export function genResourceQueryKey(
	props: {
		resource: string
		fetcherName?: string
	},
): QueryKey {
	const { fetcherName, resource } = props

	return [
		fetcherName ?? 'default',
		resource,
	]
}
