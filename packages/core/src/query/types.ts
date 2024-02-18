import type { QueryKey } from '@tanstack/query-core'

export type QueryPair<TData> = [QueryKey, TData | undefined]
