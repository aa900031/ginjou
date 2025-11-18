import type { RouterGoParams } from './go'

export type RouterResolveFn<
	TGoMeta,
> = (
	to: RouterGoParams<TGoMeta>,
) => string
