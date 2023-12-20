import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { getResourceDefinition } from '@ginjou/core'
import { type UseResourceContextProps, useResourceContext } from './context'

export interface UseResourceProps {
	name?: MaybeRef<string | undefined>
}

export type UseResourceContext = Simplify<
	& UseResourceContextProps
>

export function useResource(
	props?: UseResourceProps,
	context?: UseResourceContext,
) {
	const resource = useResourceContext(context)
	// TODO: find by router

	return computed(() => {
		const name = unref(props?.name)
		return getResourceDefinition(resource, name)
	})
}
