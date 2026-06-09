import type { BaseRecord } from '@ginjou/core'
import type { UseGetManyByOneContext, UseGetManyByOneProps, UseGetManyByOneResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useGetManyByOne } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncGetManyByOne<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetManyByOneProps<TData, TError, TResultData>,
	context?: UseGetManyByOneContext,
): AsyncResult<UseGetManyByOneResult<TData, TError, TResultData>> {
	const query = useGetManyByOne(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
