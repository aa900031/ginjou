import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { ResolvedResource } from '@ginjou/core'
import { resolveResource } from '@ginjou/core'
import type { UseLocationContext } from '../router'
import { useLocation } from '../router'
import { type UseResourceContextProps, useResourceContext } from './context'

export interface UseResourceProps {
	name?: MaybeRef<string | undefined>
}

export type UseResourceContext = Simplify<
	& UseResourceContextProps
	& UseLocationContext
>

export type UseResourceResult = Ref<
	| ResolvedResource
	| undefined
>

export function useResource(
	props?: UseResourceProps,
	context?: UseResourceContext,
): UseResourceResult {
	const resource = useResourceContext(context)
	const location = useLocation(context)

	return computed(() => resolveResource(
		resource,
		{
			name: unref(props?.name),
			location: unref(location),
		},
	))
}
