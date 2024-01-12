import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'
import type { Access } from '@ginjou/core'

const KEY: InjectionKey<Access> = Symbol('@ginjou/access')

export function defineAccess<
	T extends Access,
>(value: T) {
	provide(KEY, value)
	return value
}

export interface UseAccessContextFromProps {
	access?: Access
}

export type UseAccessContextProps = Simplify<
	& UseAccessContextFromProps
	& {
		strict?: boolean
	}
>

export function useAccessContext(
	props: UseAccessContextProps & { strict: true },
): Access

export function useAccessContext(
	props?: UseAccessContextProps,
): Access | undefined

export function useAccessContext(
	props?: UseAccessContextProps,
): Access | undefined {
	const value = inject(KEY, undefined) ?? props?.access
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
