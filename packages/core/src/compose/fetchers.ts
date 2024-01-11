import type { SetRequired } from 'type-fest'

export interface FetcherProps {
	fetcherName?: string
}

export type ResolvedFetcherProps = SetRequired<
	FetcherProps,
	| 'fetcherName'
>

export function resolveFetcherProps(
	props: FetcherProps,
): ResolvedFetcherProps {
	return {
		fetcherName: props.fetcherName ?? 'default',
	}
}
