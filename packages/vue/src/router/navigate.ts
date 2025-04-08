import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UseResourceContext } from '../resource'
import type { UseGoContext } from './go'
import { createNavigateToFn } from '@ginjou/core'
import { toRef } from '@vueuse/shared'
import { unref } from 'vue-demi'
import { useResource, useResourceContext } from '../resource'
import { useGo } from './go'

export interface UseNavigateToProps {
	resource?: MaybeRef<string | undefined>
}

export type UseNavigateToContext = Simplify<
	& UseGoContext
	& UseResourceContext
>

export function useNavigateTo(
	props?: UseNavigateToProps,
	context?: UseNavigateToContext,
) {
	const go = useGo(context)
	const resource = useResource({
		name: toRef(() => unref(props?.resource)),
	}, context)
	const resourceContext = useResourceContext(context)

	return createNavigateToFn({
		go,
		getResource: () => unref(resource),
		resourceContext,
	})
}
