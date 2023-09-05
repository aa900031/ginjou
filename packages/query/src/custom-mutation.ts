import type { MutationFunction } from '@tanstack/query-core'
import type { InvalidateTargetType } from './invalidate'
import type { BaseRecord, CustomProps, CustomResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export type CustomMutationProps<
	TQuery = unknown,
	TPayload = unknown,
> =
	& CustomProps<TQuery, TPayload>
	& {
		fetcherName?: string
		invalidates?: InvalidateTargetType[]
	}

export function createCustomMutationFn<
	TData extends BaseRecord = BaseRecord,
	TQuery = unknown,
	TPayload = unknown,
>(
	fetchers: Fetchers,
): MutationFunction<CustomResult<TData>, CustomMutationProps<TQuery, TPayload>> {
	return async function customMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)
		if (typeof fetcher.custom !== 'function')
			throw new Error('Not implemented custom on data provider')

		const result = await fetcher.custom<TData, TQuery, TPayload>(props)

		return result
	}
}
