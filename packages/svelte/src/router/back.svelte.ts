import type { RouterBackFn } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseRouterContextFromProps } from './context'
import { useRouterContext } from './context'

export type UseBackContext = Simplify<
	& UseRouterContextFromProps
>

export function useBack(
	context?: UseBackContext,
): RouterBackFn {
	const router = useRouterContext(context)

	return () => router?.back()
}
