import type { ValueOf } from 'type-fest'

export const RouterGoType = {
	Push: 'push',
	Replace: 'replace',
	// Path: 'path',
} as const

export type RouterGoTypeValues = ValueOf<typeof RouterGoType>

export interface RouterGoParams<
	TMeta = unknown,
> {
	to: string
	type?: RouterGoTypeValues
	query?: Record<string, string | number | null | undefined>
	hash?: string
	keepHash?: boolean
	keepQuery?: boolean
	meta?: TMeta
}

export type RouterGoFn<
	TMeta = unknown,
> = (params: RouterGoParams<TMeta>) => void | string

export type RouterBackFn = () => void

export type RouterGetLocationFn<
	TMeta = unknown,
> = () => RouterLocation<TMeta>

export interface RouterLocation<
	TMeta = unknown,
> {
	path: string
	params?: Record<string, string | string[]>
	query?: Record<string, string | null | ((string | null)[])>
	hash?: string
	meta?: TMeta
}

export type RouterOnChangeLocationFn<
	TMeta = unknown,
> = (handler: (value: RouterLocation<TMeta>) => void) => () => void

export interface Router<
	TGoMeta = unknown,
	TParsedMeta = unknown,
> {
	go: RouterGoFn<TGoMeta>
	back: RouterBackFn
	getLocation: RouterGetLocationFn<TParsedMeta>
	onChangeLocation: RouterOnChangeLocationFn<TParsedMeta>
}
