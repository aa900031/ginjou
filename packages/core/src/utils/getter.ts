export function getter<
	TFn extends unknown | (() => unknown) | ((...args: unknown[]) => unknown),
>(
	value: TFn,
	...args: TFn extends (...args: infer TArgs) => unknown ? TArgs : []
): TFn extends (...args: any[]) => infer TReturn ? TReturn : TFn {
	if (typeof value === 'function') {
		return value(...args)
	}
	return value as any
}
