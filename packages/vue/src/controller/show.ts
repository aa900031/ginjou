import type { Simplify } from 'type-fest'
import type { BaseRecord } from '@ginjou/core'
import { computed } from 'vue-demi'
import { type UseGetOneContext, type UseGetOneResult, useGetOne } from '../query'

export interface UseShowControllerProps {

}

export type UseShowControllerContext = Simplify<
	& UseGetOneContext
>

export type UseShowControllerResult<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& UseGetOneResult<TData, TError, TResultData>
>

export function useShowController<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseShowControllerProps,
	context?: UseShowControllerContext,
): UseShowControllerResult<TData, TError, TResultData> {
	const one = useGetOne<TData, TError, TResultData>({
		...props,
		queryOptions: computed(() => ({

		})),
	}, context)
}
