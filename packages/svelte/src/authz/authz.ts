import type { Authz } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/authz')

export function defineAuthzContext<T extends Authz>(value: T): T {
	return defineContext(KEY, value)
}

export interface UseAuthzContextFromProps {
	authz?: Authz
}

export type UseAuthzContextProps = Simplify<
	& UseAuthzContextFromProps
	& {
		strict?: boolean
	}
>

export function useAuthzContext(
	props: UseAuthzContextProps & { strict: true },
): Authz

export function useAuthzContext(
	props?: UseAuthzContextProps,
): Authz | undefined

export function useAuthzContext(
	props?: UseAuthzContextProps,
): Authz | undefined {
	const value = useContextValue(KEY, props?.authz)

	if (props?.strict === true)
		return requireContext(value, 'authz')

	return value
}
