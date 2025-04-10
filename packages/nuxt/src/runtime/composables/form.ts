import type { BaseRecord } from '@ginjou/core'
import type { UseFormContext, UseFormProps, UseFormResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useForm } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncForm<
	TQueryData extends BaseRecord = BaseRecord,
	TMutationParams = unknown,
	TQueryError = unknown,
	TQueryResultData extends BaseRecord = TQueryData,
	TMutationData extends BaseRecord = TQueryResultData,
	TMutationError = unknown,
>(
	props?: UseFormProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
	context?: UseFormContext,
): AsyncResult<UseFormResult<TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>> {
	const result = useForm(props, context)
	return withAsync(result, async () => {
		await result.query.suspense()
	})
}
