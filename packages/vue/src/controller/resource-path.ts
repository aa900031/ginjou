import type { ResourceAction } from '@ginjou/core'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseResourceContext } from './resource'
import { ResourcePath } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useResource } from './resource'

export interface UseResourcePathProps {
	action: MaybeRef<ResourceAction.TypeValues>
	resource?: MaybeRef<string>
	params?: MaybeRef<Record<string, any>>
}

export type UseResourcePathContext = Simplify<
	& UseResourceContext
>

export type UseResourcePathResult = Ref<string | undefined>

export function useResourcePath(
	props: UseResourcePathProps,
	context?: UseResourcePathContext,
): UseResourcePathResult {
	const controller = useResource({
		name: props.resource,
	}, context)

	return computed(() => ResourcePath.get({
		resolved: unref(controller),
		action: unref(props.action),
		params: unref(props.params),
	}))
}
