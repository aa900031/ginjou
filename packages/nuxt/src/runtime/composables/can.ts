import type { UseCanAccessContext, UseCanAccessProps, UseCanAccessResult } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { useCanAccess } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncCanAccess<
	TError = unknown,
>(
	props: UseCanAccessProps<TError>,
	context?: UseCanAccessContext,
): AsyncResult<UseCanAccessResult<TError>> {
	const query = useCanAccess(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
