import type { Router } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<Router<any, any>> = Symbol('@ginjou/router')

export function defineRouterContext<
	T extends InjectionGetter<Router<any, any>>,
>(
	value: T,
	provideFn: ProvideFn = provide,
): T {
	provideFn(KEY, value)
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
	const value = injectGetter(KEY) ?? props?.router
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
