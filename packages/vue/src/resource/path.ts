import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { ResourceActionTypeValues } from '@ginjou/core'
import { createResourcePath } from '@ginjou/core'
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
): Ref<string | undefined> {
	const resource = useResource({
		name: props.resource,
	}, context)

	return computed(() => createResourcePath({
		resolved: unref(resource),
		action: unref(props.action),
		params: unref(props.params),
	}))
}
