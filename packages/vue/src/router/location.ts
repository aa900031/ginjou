import type { RouterLocation } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseRouterContextFromProps } from './context'
import { ref } from 'vue-demi'
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

	const result = ref(router?.getLocation()) as Ref<RouterLocation<TMeta> | undefined>
	router?.onChangeLocation((location) => {
		result.value = location
	})

	return result
}
