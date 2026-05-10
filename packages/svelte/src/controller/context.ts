import type { Controller } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/controller')

export function defineControllerContext<T extends Controller>(value: T): T {
	return defineContext(KEY, value)
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
	const value = useContextValue(KEY, props?.controller)

	if (props?.strict === true)
		return requireContext(value, 'controller')

	return value
}
