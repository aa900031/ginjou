import type { Simplify } from 'type-fest'
import type { RouterGoFn } from '@ginjou/router'
import type { UseRouterContextFromProps } from './context'
import { useRouterContext } from './context'

export type UseGoContext = Simplify<
	& UseRouterContextFromProps
>

export function useGo<
	TRouteGoMeta = unknown,
>(
	context?: UseGoContext,
): RouterGoFn<TRouteGoMeta> {
	const router = useRouterContext(context)

	return params => router?.go(params)
}
