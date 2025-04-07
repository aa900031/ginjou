import type { BaseRecord } from '@ginjou/core'
import type { UseGetOneContext, UseGetOneProps, UseGetOneResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useGetOne } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncGetOne<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetOneProps<TData, TError, TResultData>,
	context?: UseGetOneContext,
): AsyncResult<UseGetOneResult<TError, TResultData>> {
	const query = useGetOne(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
