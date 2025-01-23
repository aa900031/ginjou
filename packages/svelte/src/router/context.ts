import type { Router } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { getContext, setContext } from 'svelte'

const KEY = '$$_@ginjou/router'

export function defineRouterContext<
	T extends Router<any, any>,
>(
	value: T,
): T {
	setContext(KEY, value)
	return value
}

export interface UseRouterContextFromProps {
	router?: Router<any, any>
}

export type UseRouterContextProps = Simplify<
	& UseRouterContextFromProps
	& {
		strict?: boolean
	}
>

export function useRouterContext<
	TGoMeta = unknown,
	TLocationMeta = unknown,
>(
	props: UseRouterContextProps & { strict: true },
): Router<TGoMeta, TLocationMeta>

export function useRouterContext<
	TGoMeta = unknown,
	TLocationMeta = unknown,
>(
	props?: UseRouterContextProps,
): Router<TGoMeta, TLocationMeta> | undefined

export function useRouterContext(
	props?: UseRouterContextProps,
): Router<any, any> | undefined {
	const value = getContext<Router<any, any>>(KEY) ?? props?.router
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
