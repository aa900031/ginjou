import type { addImports } from '@nuxt/kit'

export type Import = Parameters<typeof addImports> extends [infer T]
	? T
	: never
