import type { Auth } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/auth')

export function defineAuthContext<T extends Auth>(value: T): T {
	return defineContext(KEY, value)
}

export interface UseAuthContextFromProps {
	auth?: Auth
}

export type UseAuthContextProps = Simplify<
	& UseAuthContextFromProps
	& {
		strict?: boolean
	}
>

export function useAuthContext(
	props: UseAuthContextProps & { strict: true },
): Auth

export function useAuthContext(
	props?: UseAuthContextProps,
): Auth | undefined

export function useAuthContext(
	props?: UseAuthContextProps,
): Auth | undefined {
	const value = useContextValue(KEY, props?.auth)

	if (props?.strict === true)
		return requireContext(value, 'auth')

	return value
}
