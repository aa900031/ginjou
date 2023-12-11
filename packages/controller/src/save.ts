import type { Promisable } from 'type-fest'

export type SaveNormalResult = Promise<void>

export type SaveErroResult = Promise<Record<string, string[]>>

export type SaveSuccessCallback<
	TResult = unknown,
	TProps = unknown,
	TContext = undefined,
> = (
	result: TResult,
	props: TProps,
	context?: TContext,
) => Promisable<void | unknown | true>

export type SaveErrorCallback<
	TError = unknown,
	TProps = unknown,
	TContext = undefined,
> = (
	error: TError,
	props: TProps,
	context?: TContext,
) => Promisable<void | unknown | true>

export interface SaveOptions<
	TResult = unknown,
	TError = unknown,
	TProps = unknown,
	TContext = undefined,
> {
	onSuccess?: SaveSuccessCallback<TResult, TProps, TContext>
	onError?: SaveErrorCallback<TError, TProps, TContext>
}

export type SaveFunction<
	TValues,
	TResult = unknown,
	TError = unknown,
	TProps = unknown,
	TContext = unknown,
> = (
	values: TValues,
	options?: SaveOptions<TResult, TError, TProps, TContext>,
) => SaveNormalResult | SaveErroResult

export function toMutateOptions<
	T extends { onSuccess?: any; onError?: any; [key: string]: any },
	TResult = unknown,
	TError = unknown,
	TProps = unknown,
	TContext = unknown,
>(
	target: T | undefined,
	options?: SaveOptions<TResult, TError, TProps, TContext>,
): T {
	return Object.assign(target ?? {}, {
		onSuccess: options?.onSuccess ?? target?.onSuccess,
		onError: options?.onError ?? target?.onError,
	}) as T
}
