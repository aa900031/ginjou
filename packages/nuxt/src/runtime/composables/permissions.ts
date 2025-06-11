import type { UsePermissionsProps, UsePermissionsResult, UserPermissionsContext } from '@ginjou/vue'
import type { AsyncResult } from '../utils/async'
import { usePermissions } from '@ginjou/vue'
import { withAsync } from '../utils/async'

export function useAsyncPermissions<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
>(
	props?: UsePermissionsProps<TData, TParams, TError>,
	context?: UserPermissionsContext,
): AsyncResult<UsePermissionsResult<TData, TError>> {
	const query = usePermissions(props, context)
	return withAsync(query, async () => {
		await query.suspense()
	})
}
