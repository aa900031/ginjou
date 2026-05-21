import type { ValueOf } from 'type-fest'

export const RouterGoType = {
	Push: 'push',
	Replace: 'replace',
} as const

export type RouterGoTypeValues = ValueOf<typeof RouterGoType>

export interface RouterGoParams<
	TMeta = unknown,
> {
	to?: string
	type?: RouterGoTypeValues
	query?: Record<string, string | number | null | undefined>
	hash?: string
	keepHash?: boolean
	keepQuery?: boolean
	meta?: TMeta
}

export type RouterGoFn<
	TMeta,
> = (
	params: RouterGoParams<TMeta>,
) => void

export type RouterBackFn = () => void

export interface RouterLocation<
	TMeta = unknown,
> {
	path: string
	/**
	 * Object of decoded params extracted from the `path`.
	 */
	params?: Record<string, string | string[]>
	query?: Record<string, string | null | ((string | null)[])>
	hash?: string
	meta?: TMeta
}

export type RouterLocationGetFn<
	TMeta,
> = () => RouterLocation<TMeta>

export type RouterLocationOnChangeFn<
	TMeta,
> = (
	handler: (value: RouterLocation<TMeta>) => void,
) => () => void

export type RouterResolveFn<
	TGoMeta,
> = (
	to: RouterGoParams<TGoMeta>,
) => string

export interface Router {
	go: RouterGoFn<any>
	back: RouterBackFn
	resolve: RouterResolveFn<any>
	getLocation: RouterLocationGetFn<any>
	onChangeLocation: RouterLocationOnChangeFn<any>
}

/* @__NO_SIDE_EFFECTS__ */
export function defineRouter<
	T extends Router,
>(
	value: T,
): T {
	return value
}
