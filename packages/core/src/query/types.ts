import type { MutateFunction, MutationOptions, QueryKey } from '@tanstack/query-core'

export type QueryPair<TData> = [QueryKey, TData | undefined]

/**
 * @deprecated
 */
export type MutateHandler<
	TVariables = void,
	TContext = unknown,
> = NonNullable<MutationOptions<unknown, unknown, TVariables, TContext>['onMutate']>

/**
 * @deprecated
 */
export type SuccessHandler<
	TData = unknown,
	TVariables = void,
	TContext = unknown,
> = NonNullable<MutationOptions<TData, unknown, TVariables, TContext>['onSuccess']>

/**
 * @deprecated
 */
export type ErrorHandler<
	TError = unknown,
	TVariables = void,
	TContext = unknown,
> = NonNullable<MutationOptions<unknown, TError, TVariables, TContext>['onError']>

/**
 * @deprecated
 */
export type SettledHandler<
	TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = NonNullable<MutationOptions<TData, TError, TVariables, TContext>['onSettled']>