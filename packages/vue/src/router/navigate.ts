import type { ToMaybeRefs } from '@bouzu/vue-helper'
import type { Simplify } from 'type-fest'
import type { UseResourceContext } from '../controller'
import type { UseGoContext } from './go'
import { Navigate } from '@ginjou/core'
import { unref } from 'vue-demi'
import { useControllerContext } from '../controller'
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
): Navigate.ToFn {
	const controllerContext = useControllerContext(context)
	const go = useGo(context)

	return Navigate.createToFn({
		go,
		getResourceFromProp: () => unref(props?.resource),
		controller: controllerContext,
	})
}
