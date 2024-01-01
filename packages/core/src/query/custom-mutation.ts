import type { MutationOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { InvalidateTargetType } from './invalidate'
import type { BaseRecord, CustomProps, CustomResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export type CustomMutationProps<
	TQuery = unknown,
	TPayload = unknown,
> = Simplify<
	& CustomProps<TQuery, TPayload>
	& {
		fetcherName?: string
		invalidates?: InvalidateTargetType[]
	}
>

export type CustomMutationOptions<
	TData extends BaseRecord,
	TQuery,
	TPayload,
	TError,
> = MutationOptions<
	CustomResult<TData>,
	TError,
	CustomMutationProps<TQuery, TPayload>
>

export function createCustomMutationFn<
	TData extends BaseRecord = BaseRecord,
	TQuery = unknown,
	TPayload = unknown,
	TError = unknown,
>(
	fetchers: Fetchers,
): NonNullable<CustomMutationOptions<TData, TQuery, TPayload, TError>['mutationFn']> {
	return async function customMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)
		if (typeof fetcher.custom !== 'function')
			throw new Error('Not implemented custom on data provider')

		const result = await fetcher.custom<TData, TQuery, TPayload>(props)

		return result
	}
}
