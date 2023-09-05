import type { QueryKey } from '@tanstack/query-core'

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
