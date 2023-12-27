import type { MutationOptions } from '@tanstack/query-core'

export type SuccessHandler<
	TData = unknown,
	TVariables = void,
	TContext = unknown,
> = NonNullable<MutationOptions<TData, unknown, TVariables, TContext>['onSuccess']>

export type MutateHandler<
	TVariables = void,
	TContext = unknown,
> = NonNullable<MutationOptions<unknown, unknown, TVariables, TContext>['onMutate']>

export type ErrorHandler<
	TError = unknown,
	TVariables = void,
	TContext = unknown,
> = NonNullable<MutationOptions<unknown, TError, TVariables, TContext>['onError']>

export type SettledHandler<
	TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
> = NonNullable<MutationOptions<TData, TError, TVariables, TContext>['onSettled']>
