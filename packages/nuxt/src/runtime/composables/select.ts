import type { BaseRecord } from '@ginjou/core'
import type { UseSelectContext, UseSelectProps, UseSelectResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useSelect } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncSelect<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props?: UseSelectProps<TData, TError, TResultData, TPageParam>,
	context?: UseSelectContext,
): AsyncResult<UseSelectResult<TError, TResultData, TPageParam>> {
	const result = useSelect(props, context)
	return withAsync(result, async () => {
		await result.suspense()
	})
}
