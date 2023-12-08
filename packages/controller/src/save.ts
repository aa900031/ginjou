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
	TContext = undefined,
> = (
	values: TValues,
	options?: SaveOptions<TResult, TError, TProps, TContext>,
) => SaveNormalResult | SaveErroResult

export function mergeSaveOptions<
	TResult = unknown,
	TError = unknown,
	TProps = unknown,
	TContext = undefined,
>(
	...args: (Partial<SaveOptions<TResult, TError, TProps, TContext>> | undefined)[]
): SaveOptions<TResult, TError, TProps, TContext> {
	const onSuccesses: SaveSuccessCallback<TResult, TProps, TContext>[]
		= args.map(arg => arg?.onSuccess).filter(Boolean) as any
	const onErrores: SaveErrorCallback<TError, TProps, TContext>[]
		= args.map(arg => arg?.onError).filter(Boolean) as any

	return Object.assign(
		{},
		...args,
		onSuccesses.length ? { onSuccess: mergeCallback(...onSuccesses) } : undefined,
		onErrores.length ? { onError: mergeCallback(...onErrores) } : undefined,
	)
}

function mergeCallback<
	T extends (...args: any[]) => Promisable<true | any>,
>(
	...callbacks: (T | undefined)[]
): (...args: Parameters<T>) => Promise<void> {
	return async (...args) => {
		for (const cb of callbacks) {
			if (typeof cb !== 'function')
				continue

			if (await cb(...args))
				continue
			else
				break
		}
	}
}
