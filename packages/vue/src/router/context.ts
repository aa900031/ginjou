import type { Router } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { injectLocal, provideLocal } from '@vueuse/shared'

const KEY: InjectionKey<Router> = Symbol('@ginjou/router')

export function defineRouterContext<
	T extends Router,
>(
	value: T,
): T {
	provideLocal(KEY, value)
	return value
}

export interface UseRouterContextFromProps {
	router?: Router
}

export type UseRouterContextProps = Simplify<
	& UseRouterContextFromProps
	& {
		strict?: boolean
	}
>

export function useRouterContext(
	props: UseRouterContextProps & { strict: true },
): Router

export function useRouterContext(
	props?: UseRouterContextProps,
): Router | undefined

export function useRouterContext(
	props?: UseRouterContextProps,
): Router | undefined {
	const value = injectLocal(KEY, undefined) ?? props?.router
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
