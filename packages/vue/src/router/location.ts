import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { noop } from '@vueuse/shared'
import { eventRef } from '@bouzu/vue-helper'
import type { RouterLocation } from '@ginjou/core'
import type { UseRouterContextFromProps } from './context'
import { useRouterContext } from './context'

export type UseLocationContext = Simplify<
	& UseRouterContextFromProps
>

export type UseLocationResult<
	TMeta = unknown,
> = Ref<
	| RouterLocation<TMeta>
	| undefined
>

export function useLocation<
	TMeta = unknown,
>(
	context?: UseLocationContext,
): UseLocationResult<TMeta> {
	const router = useRouterContext<unknown, TMeta>(context)

	const [result] = eventRef({
		register: (handler) => {
			if (!router)
				return noop

			return router.onChangeLocation!(handler)
		},
		get: () => router?.getLocation(),
	})

	return result
}
