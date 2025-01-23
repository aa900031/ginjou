import type { Auth } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { getContext, setContext } from 'svelte'

const KEY = '$$_@ginjou/auth'

export function defineAuthContext<
	T extends Auth,
>(
	value: T,
): T {
	setContext(KEY, value)

	return value
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
	const value = getContext<Auth>(KEY) ?? props?.auth
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
