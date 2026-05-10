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
			throw new Error('[@ginjou/vue] Cannot resolve path because no router context was found. Use defineRouterContext() before calling useResolvePath().')

		return router.resolve(to)
	}
}
