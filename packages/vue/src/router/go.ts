import type { Simplify } from 'type-fest'
import type { RouterGoFn } from '@ginjou/core'
import type { UseRouterContextFromProps } from './context'
import { useRouterContext } from './context'

export type UseGoContext = Simplify<
	& UseRouterContextFromProps
>

export function useGo<
	TMeta = unknown,
>(
	context?: UseGoContext,
): RouterGoFn<TMeta> {
	const router = useRouterContext(context)

	return params => router?.go(params)
}
