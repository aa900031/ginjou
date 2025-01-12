import type { Auth } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<Auth> = Symbol('@ginjou/auth')

export function defineAuthContext<
	T extends InjectionGetter<Auth>,
>(
	value: T,
	provideFn: ProvideFn = provide,
) {
	provideFn(KEY, value)
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
	const value = injectGetter(KEY) ?? props?.auth
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
