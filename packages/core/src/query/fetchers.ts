import type { SetRequired } from 'type-fest'
import type { Fetcher } from './fetcher'

export type Fetchers = Record<string, Fetcher>

export function getFetcher(
	props: ResolvedFetcherProps,
	fetchers?: Fetchers,
) {
	if (!fetchers)
		throw new Error('Data Provider not exists!')

	// TODO: remove default values
	const target = fetchers[props.fetcherName]
	if (!target)
		throw new Error(`Data Provider (${props.fetcherName}) not exists!`)

	return target
}

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
