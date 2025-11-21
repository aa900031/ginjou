import type { ResolvedResource } from './resolve'

export interface GetFetcherNameProps {
	resource: ResolvedResource | undefined
	fetcherNameFromProp: string | undefined
}

export function getFetcherName(
	{
		resource,
		fetcherNameFromProp,
	}: GetFetcherNameProps,
): string | undefined {
	return fetcherNameFromProp ?? resource?.resource.meta?.fetcherName
}
