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
		throw new Error('[@ginjou/core] No fetchers are registered. Provide fetchers before running a query or mutation.')

	// TODO: remove default values
	const target = fetchers[props.fetcherName]
	if (!target)
		throw new Error(`[@ginjou/core] Fetcher '${props.fetcherName}' is not registered. Check meta.fetcherName or defineFetchersContext().`)

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
		throw new Error(`[@ginjou/core] Fetcher '${props.fetcherName}' does not implement required function '${String(name)}'.`)
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
