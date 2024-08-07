import type { QueryKey } from '@tanstack/query-core'

export interface ResourceQueryProps {
	fetcherName: string
	resource: string
}

export interface CreateQueryKeyProps {
	props: ResourceQueryProps
}

export function createQueryKey(
	{
		props,
	}: CreateQueryKeyProps,
): QueryKey {
	const { fetcherName, resource } = props

	return [
		fetcherName,
		resource,
	]
}
