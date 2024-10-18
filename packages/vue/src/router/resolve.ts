import type { RouterResolveFn } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseRouterContextFromProps } from './context'
import { useRouterContext } from './context'

export type UseResolvePathContext = Simplify<
	& UseRouterContextFromProps
>

export function useResolvePath<
	TMeta = unknown,
>(
	context?: UseResolvePathContext,
): RouterResolveFn<TMeta> {
	const router = useRouterContext(context)

	return (to) => {
		if (!router)
			throw new Error('No')

		return router.resolve(to)
	}
}
