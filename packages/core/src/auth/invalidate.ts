import type { QueryClient } from '@tanstack/query-core'
import { createQueryKey as createCheckQueryKey } from './check'
import { createQueryKey as createIdentityQueryKey } from './identity'
import { createQueryKey as createPermissionsQueryKey } from './permissions'

export async function triggerInvalidateAll(
	queryClient: QueryClient,
) {
	await Promise.all(
		[
			createCheckQueryKey(),
			createIdentityQueryKey(),
			createPermissionsQueryKey(),
		].map(key => queryClient.invalidateQueries(key)),
	)
}
