import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseLocationContext } from '../router'
import type { UseControllerContextFromProps } from './context'
import { Resource } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useLocation } from '../router'
import { useControllerContext } from './context'

export interface UseResourceProps {
	name?: MaybeRef<string | undefined>
}

export type UseResourceContext = Simplify<
	& UseControllerContextFromProps
	& UseLocationContext
>

export type UseResourceResult = Ref<
	| Resource.Resolved
	| undefined
>

export function useResource(
	props?: UseResourceProps,
	context?: UseResourceContext,
): UseResourceResult {
	const controller = useControllerContext(context)
	const location = useLocation(context)

	return computed(() => Resource.resolve(
		controller,
		{
			name: unref(props?.name),
			location: unref(location),
		},
	))
}
