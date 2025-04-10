import type { BaseRecord } from '@ginjou/core'
import type { UseShowContext, UseShowProps, UseShowResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useShow } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncShow<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props?: UseShowProps<TData, TError, TResultData>,
	context?: UseShowContext,
): AsyncResult<UseShowResult<TError, TResultData>> {
	const query = useShow(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
