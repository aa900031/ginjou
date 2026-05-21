import type { ValueOf } from 'type-fest'
import type { RecordKey } from '../query'
import type { RouterLocation } from '../router'

export const Type = {
	List: 'list',
	Create: 'create',
	Edit: 'edit',
	Show: 'show',
} as const

export type TypeValues = ValueOf<typeof Type>

export type ForForm = Extract<TypeValues, 'create' | 'edit' | 'clone'>

export interface ParseResult {
	action: TypeValues
	id?: RecordKey
}

export type ParseFn<
	TLocationMeta = unknown,
> = (
	location: RouterLocation<TLocationMeta>,
) => ParseResult | undefined

export interface Parse {
	pattern: string
	parse: ParseFn
}
