import type { UseAuthenticatedContext, UseAuthenticatedProps, UseAuthenticatedResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useAuthenticated } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncAuthenticated<
	TParams = unknown,
	TError = unknown,
>(
	props?: UseAuthenticatedProps<TParams, TError>,
	context?: UseAuthenticatedContext,
): AsyncResult<UseAuthenticatedResult<TError>> {
	const query = useAuthenticated(props, context)

	return withAsync(query, async () => {
		await query.suspense()
	})
}
