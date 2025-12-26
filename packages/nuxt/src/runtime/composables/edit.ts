import type { BaseRecord, Params } from '@ginjou/core'
import type { UseEditContext, UseEditProps, UseEditResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useEdit } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncEdit<
	TQueryData extends BaseRecord = BaseRecord,
	TMutationParams extends Params = Params,
	TQueryError = unknown,
	TQueryResultData extends BaseRecord = TQueryData,
	TMutationData extends BaseRecord = TQueryResultData,
	TMutationError = unknown,
>(
	props?: UseEditProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
	context?: UseEditContext,
): AsyncResult<UseEditResult<TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>> {
	const result = useEdit(props, context)
	return withAsync(result, async () => {
		await result.query.suspense()
	})
}
