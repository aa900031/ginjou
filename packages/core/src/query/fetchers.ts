import type { SetRequired } from 'type-fest'
import type { Fetcher } from './fetcher'

export type Fetchers = Record<string, Fetcher>

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

// TODO: turns internal
export function getFetcher(
	props: ResolvedFetcherProps,
	fetchers: Fetchers | undefined,
): Fetcher {
	if (!fetchers)
		throw new Error('Data Provider not exists!')

	// TODO: remove default values
	const target = fetchers[props.fetcherName]
	if (!target)
		throw new Error(`Data Provider (${props.fetcherName}) not exists!`)

	return target
}

export function getFetcherFn<
	TName extends keyof Fetcher,
>(
	props: ResolvedFetcherProps,
	fetchers: Fetchers | undefined,
	name: TName,
): NonNullable<Fetcher[TName]> {
	const fetcher = getFetcher(props, fetchers)
	const fn = fetcher[name]
	if (!fn || typeof fn !== 'function')
		throw new Error(`Fetcher function: ${name} not exists`)
	return fn
}

export function getSafeFetcherFn<
	TName extends keyof Fetcher,
>(
	props: ResolvedFetcherProps,
	fetchers: Fetchers | undefined,
	name: TName,
): Fetcher[TName] {
	const fetcher = getFetcher(props, fetchers)
	const fn = fetcher[name]
	if (fn != null && typeof fn === 'function')
		return fn
}
