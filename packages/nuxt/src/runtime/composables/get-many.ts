import type { BaseRecord } from '@ginjou/core'
import type { UseGetManyContext, UseGetManyProps, UseGetManyResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useGetMany } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncGetMany<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetManyProps<TData, TError, TResultData>,
	context?: UseGetManyContext,
): AsyncResult<UseGetManyResult<TData, TError, TResultData>> {
	const query = useGetMany(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
