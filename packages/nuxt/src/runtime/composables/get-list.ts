import type { BaseRecord } from '@ginjou/core'
import type { UseGetListContext, UseGetListProps, UseGetListResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useGetList } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncGetList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props: UseGetListProps<TData, TError, TResultData, TPageParam>,
	context?: UseGetListContext,
): AsyncResult<UseGetListResult<TError, TResultData, TPageParam>> {
	const query = useGetList(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
