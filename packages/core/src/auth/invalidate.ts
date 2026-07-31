import type { QueryClient } from '@tanstack/query-core'
import { createQueryKey as genCanAccessQueryKey } from '../authz/can'
import { createQueryKey as genPermissionsQueryKey } from '../authz/permissions'
import { createQueryKey as genCheckQueryKey } from './check'
import { createQueryKey as genIdentityQueryKey } from './identity'

export async function triggerInvalidateAll(
	queryClient: QueryClient,
): Promise<void> {
	await Promise.all(
		[
			genCheckQueryKey(),
			genIdentityQueryKey(),
			genPermissionsQueryKey(),
			genCanAccessQueryKey({}),
		].map(key => queryClient.invalidateQueries(
			{
				queryKey: key,
			},
		)),
	)
}
