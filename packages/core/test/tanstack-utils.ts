import type { QueryFunctionContext, QueryKey } from '@tanstack/query-core'
import { vi } from 'vitest'

export function createQueryContext<TQueryKey extends QueryKey = QueryKey>(
	options: Partial<QueryFunctionContext<TQueryKey>> = {},
): QueryFunctionContext<TQueryKey> {
	return {
		client: vi.mockObject({} as any),
		queryKey: options.queryKey ?? ([] as any),
		signal: options.signal ?? new AbortController().signal,
		meta: options.meta,
		pageParam: options.pageParam,
	}
}

export function createMutationContext(): any {
	return {}
}
