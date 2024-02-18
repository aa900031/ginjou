import type { RouterGoParams } from './go'

export type RouterResolveFn<
	TGoMeta = unknown,
> = (to: RouterGoParams<TGoMeta>) => string
