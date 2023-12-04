import type { ValueOf } from 'type-fest'

export interface RouterGoParams {
	to: string
	type?: RouterGoTypeValues
	query?: Record<string, unknown>
	hash?: string
	keepHash?: boolean
	keepQuery?: boolean
}

export const RouterGoType = {
	Push: 'push',
	Replace: 'replace',
	// Path: 'path',
} as const

export type RouterGoTypeValues = ValueOf<typeof RouterGoType>

export interface Router {
	go: (params: RouterGoParams) => void | string
	back: () => void
	// parse?: () => void
}

export function defaultRouteGo(_params: RouterGoParams) {
	// TODO: Show warning at Dev mode
}
