import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
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

export function useResource(
	props?: UseResourceProps,
	context?: UseResourceContext,
) {
	const resource = useResourceContext(context)
	const location = useLocation(context)

	return computed(() => {
		if (!resource)
			return

		return resolveResource(resource, {
			name: unref(props?.name),
			location: unref(location),
		})
	})
}
