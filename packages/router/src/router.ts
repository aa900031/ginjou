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

export type RouterGetCurrentFn<
	TMeta = unknown,
> = () => RouterParsedValue<TMeta>

export interface RouterParsedValue<
	TMeta = unknown,
> {
	path: string
	params?: Record<string, string | string[]>
	query?: Record<string, string | null | ((string | null)[])>
	hash?: string
	meta?: TMeta
}

export type RouterOnCurrentChangeFn<
	TMeta = unknown,
> = (handler: (value: RouterParsedValue<TMeta>) => void) => () => void

export interface Router<
	TGoMeta = unknown,
	TParsedMeta = unknown,
> {
	go: RouterGoFn<TGoMeta>
	back: RouterBackFn
	getCurrent: RouterGetCurrentFn<TParsedMeta>
	onCurrentChange: RouterOnCurrentChangeFn<TParsedMeta>
}
