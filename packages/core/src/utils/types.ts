export type MaybeOptional<T> = NonNullable<T> | null | undefined

export type OptionalFallback<T, TFallback> = T extends null | undefined
	? TFallback
	: NonNullable<T>
