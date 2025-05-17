import type { BaseRecord } from '@ginjou/core'
import type { UseInfiniteListContext, UseInfiniteListProps, UseInfiniteListResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useInfiniteList } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncInfiniteList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props?: UseInfiniteListProps<TData, TError, TResultData, TPageParam>,
	context?: UseInfiniteListContext,
): AsyncResult<UseInfiniteListResult<TError, TResultData, TPageParam>> {
	const query = useInfiniteList(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
