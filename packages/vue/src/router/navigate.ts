import type { ToMaybeRefs } from '@bouzu/vue-helper'
import type { Simplify } from 'type-fest'
import type { UseResourceContext } from '../resource'
import type { UseGoContext } from './go'
import { Navigate } from '@ginjou/core'
import { unref } from 'vue-demi'
import { useResourceContext } from '../resource'
import { useGo } from './go'

export type UseNavigateToProps = ToMaybeRefs<
	Navigate.Props
>

export type UseNavigateToContext = Simplify<
	& UseGoContext
	& UseResourceContext
>

export function useNavigateTo(
	props?: UseNavigateToProps,
	context?: UseNavigateToContext,
) {
	const resourceContext = useResourceContext(context)
	const go = useGo(context)

	return Navigate.createToFn({
		go,
		getResourceFromProp: () => unref(props?.resource),
		resource: resourceContext,
	})
}
