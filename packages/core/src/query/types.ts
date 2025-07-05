import type { MutateFunction, MutateOptions, QueryKey } from '@tanstack/query-core'
import { SetReturnType } from 'type-fest'

export type QueryPair<TData> = [QueryKey, TData | undefined]

export type UpdaterFn<TInput, TOutput = TInput> = (input: TInput | undefined) => TOutput | undefined

export type OriginMutateSyncFunction<
	TData = unknown,
	TError = unknown,
	TVariables = void,
	TContext = unknown,
> = SetReturnType<
	MutateFunction<TData, TError, TVariables, TContext>,
	void
>

export type OriginMutateAsyncFunction<
	TData = unknown,
	TError = unknown,
	TVariables = void,
	TContext = unknown,
> = MutateFunction<TData, TError, TVariables, TContext>

export type OptionalMutateSyncFunction<
	TData = unknown,
	TError = unknown,
	TVariables = void,
	TContext = unknown,
> = (
	variables?: TVariables,
	options?: MutateOptions<TData, TError, TVariables, TContext>
) => void

export type OptionalMutateAsyncFunction<
	TData = unknown,
	TError = unknown,
	TVariables = void,
	TContext = unknown,
> = (
	variables?: TVariables,
	options?: MutateOptions<TData, TError, TVariables, TContext>
) => Promise<TData>
