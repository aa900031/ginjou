import type { QueryClient } from '@tanstack/query-core'
import { createQueryKey as createCanAccessQueryKey } from '../authz/can'
import { createQueryKey as createPermissionsQueryKey } from '../authz/permissions'
import { createQueryKey as createCheckQueryKey } from './check'
import { createQueryKey as createIdentityQueryKey } from './identity'

export async function triggerInvalidateAll(
	queryClient: QueryClient,
): Promise<void> {
	await Promise.all(
		[
			createCheckQueryKey(),
			createIdentityQueryKey(),
			createPermissionsQueryKey(),
			createCanAccessQueryKey({}),
		].map(key => queryClient.invalidateQueries(
			{
				queryKey: key,
			},
		)),
	)
}
