import type { Controller } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { injectLocal, provideLocal } from '@vueuse/shared'

const KEY: InjectionKey<Controller> = Symbol('@ginjou/controller')

export function defineControllerContext<
	T extends Controller,
>(
	value: T,
): T {
	provideLocal(KEY, value)
	return value
}

export interface UseControllerContextFromProps {
	controller?: Controller
}

export type UseControllerContextProps = Simplify<
	& UseControllerContextFromProps
	& {
		strict?: boolean
	}
>

export function useControllerContext(
	props: UseControllerContextProps & { strict: true },
): Controller

export function useControllerContext(
	props?: UseControllerContextProps,
): Controller | undefined

export function useControllerContext(
	props?: UseControllerContextProps,
): Controller | undefined {
	const value = injectLocal(KEY, undefined) ?? props?.controller
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
