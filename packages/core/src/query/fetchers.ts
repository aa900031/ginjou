import type { Fetcher } from './fetcher'

export type Fetchers = Record<string, Fetcher>

export function getFetcher(
	props: { fetcherName?: string },
	fetchers?: Fetchers,
) {
	if (!fetchers)
		throw new Error('Data Provider not exists!')

	// TODO: remove default values
	const name = props.fetcherName ?? 'default'
	const target = fetchers[name]
	if (!target)
		throw new Error(`Data Provider (${name}) not exists!`)

	return target
}
