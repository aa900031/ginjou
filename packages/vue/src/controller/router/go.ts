import { type Router, defaultRouteGo } from '@ginjou/core'
import { useRouterContext } from './context'

export interface UseGoContext {
	router?: Router
}

export function useGo(
	context?: UseGoContext,
) {
	const router = useRouterContext() ?? context?.router
	return router?.go ?? defaultRouteGo
}
