import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import { type MaybeRef, toRef } from '@vueuse/shared'
import { type ResourceActionTypeValues, createResourcePath } from '@ginjou/core'
import type { UseResourceContext } from './resource'
import { useResource } from './resource'

export interface UseResourcePathProps {
	action: MaybeRef<ResourceActionTypeValues>
	resource?: MaybeRef<string>
	params?: MaybeRef<Record<string, any>>
}

export type UseResourcePathContext = Simplify<
	& UseResourceContext
>

export function useResourcePath(
	props: UseResourcePathProps,
	context?: UseResourcePathContext,
) {
	const resource = useResource({
		name: toRef(props.resource),
	}, context)

	return computed(() => {
		const _resource = unref(resource)
		if (!_resource)
			return

		return createResourcePath({
			action: unref(props.action),
			resource: _resource.resource,
			...unref(props.params),
		})
	})
}
