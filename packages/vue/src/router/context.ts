import type { Simplify } from 'type-fest'
import { inject, provide } from 'vue-demi'
import type { Router } from '@ginjou/core'

const KEY = Symbol('@ginjou/router')

export function defineRouterContext<
	T extends Router,
>(value: T): T {
	provide(KEY, value)
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
	const value = inject(KEY, undefined) ?? props?.router
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
