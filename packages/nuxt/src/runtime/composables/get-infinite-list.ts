import type { BaseRecord } from '@ginjou/core'
import type { UseGetInfiniteListContext, UseGetInfiniteListProps, UseGetInfiniteListResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useGetInfiniteList } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncGetInfiniteList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props: UseGetInfiniteListProps<TData, TError, TResultData, TPageParam>,
	context?: UseGetInfiniteListContext,
): AsyncResult<UseGetInfiniteListResult<TError, TResultData, TPageParam>> {
	const query = useGetInfiniteList(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
