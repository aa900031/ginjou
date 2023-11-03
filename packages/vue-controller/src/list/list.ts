import type { UseGetListContext, UseGetListProps, UseGetListResult } from '@ginjou/vue-query'
import { useGetList } from '@ginjou/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { BaseRecord } from '@ginjou/query'
import type { Simplify } from 'type-fest'
import type { UseListParamsResult } from '..'
import { useListParams } from '..'

export type UseListProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& UseGetListProps<TData, TError, TResultData>
	& {
		resource: MaybeRef<string | undefined>
	}
>

export type UseListContext = Simplify<
	& UseGetListContext
>

export type UseListResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& UseGetListResult<TData, TError, TResultData>
	& UseListParamsResult
>

export function useList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseListProps<TData, TError, TResultData>,
	context?: UseListContext,
): UseListResult<TData, TError, TResultData> {
	const params = useListParams(props)
	const query = useGetList<TData, TError, TResultData>({
		...props,
		...params,
	}, context)

	return {
		...params,
		...query,
	}
}
