import type { BaseRecord, Params } from '@ginjou/core'
import type { UseCloneContext, UseCloneProps, UseCloneResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useClone } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncClone<
	TQueryData extends BaseRecord = BaseRecord,
	TMutationParams extends Params = TQueryData,
	TQueryError = unknown,
	TQueryResultData extends BaseRecord = TQueryData,
	TMutationData extends BaseRecord = TQueryResultData,
	TMutationError = unknown,
>(
	props?: UseCloneProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
	context?: UseCloneContext,
): AsyncResult<UseCloneResult<TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>> {
	const result = useClone(props, context)
	return withAsync(result, async () => {
		await result.query.suspense()
	})
}
