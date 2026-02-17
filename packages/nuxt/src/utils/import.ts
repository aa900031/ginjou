import type { addImports } from '@nuxt/kit'

export type Import = Parameters<typeof addImports> extends [infer T, ...any]
	? T extends Array<infer T2>
		? T2
		: T
	: never
