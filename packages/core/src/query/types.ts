import type { QueryKey } from '@tanstack/query-core'

export type QueryPair<TData> = [QueryKey, TData | undefined]

export type UpdaterFn<TInput, TOutput = TInput> = (input: TInput | undefined) => TOutput | undefined
