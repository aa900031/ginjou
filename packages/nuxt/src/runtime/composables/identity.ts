import type { UseGetIdentityContext, UseGetIdentityProps, UseGetIdentityResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useGetIdentity } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncGetIdentity<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
>(
	props?: UseGetIdentityProps<TData, TParams, TError>,
	context?: UseGetIdentityContext,
): AsyncResult<UseGetIdentityResult<TData, TError>> {
	const query = useGetIdentity(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
