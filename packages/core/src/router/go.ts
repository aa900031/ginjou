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
