import type { Authz } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'

const KEY: InjectionKey<Authz> = Symbol('@ginjou/authz')

export function defineAuthz<
	T extends Authz,
>(
	value: T,
) {
	provide(KEY, value)
	return value
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
	const value = inject(KEY, undefined) ?? props?.authz
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
