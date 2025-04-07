import type { BaseRecord } from '@ginjou/core'
import type { UseListContext, UseListProps, UseListResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useList } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props?: UseListProps<TData, TError, TResultData>,
	context?: UseListContext,
): AsyncResult<UseListResult<TError, TResultData>> {
	const query = useList(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
