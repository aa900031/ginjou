import type { Simplify } from 'type-fest'
import { eventRef } from '@bouzu/vue-helper'
import type { UseRouterContextFromProps } from './context'
import { useRouterContext } from './context'

export type UseLocationContext = Simplify<
	& UseRouterContextFromProps
>

export function useLocation(
	context?: UseLocationContext,
) {
	const router = useRouterContext(context)

	const [result] = eventRef({
		register: handler => router!.onChangeLocation!(handler),
		get: () => router!.getLocation(),
	})

	return result
}
