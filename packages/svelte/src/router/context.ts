import type { Router } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/router')

export function defineRouterContext<T extends Router>(value: T): T {
	return defineContext(KEY, value)
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
	const value = useContextValue(KEY, props?.router)

	if (props?.strict === true)
		return requireContext(value, 'router')

	return value
}
