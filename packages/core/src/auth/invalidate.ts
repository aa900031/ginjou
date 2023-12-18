import type { QueryClient } from '@tanstack/query-core'
import { genCheckQueryKey } from './check'
import { genGetIdentityQueryKey } from './identity'
import { genPermissionsQueryKey } from './permissions'

export async function triggerInvalidateAll(
	queryClient: QueryClient,
) {
	await Promise.all(
		[
			genCheckQueryKey(),
			genGetIdentityQueryKey(),
			genPermissionsQueryKey(),
		].map(key => queryClient.invalidateQueries(key)),
	)
}
