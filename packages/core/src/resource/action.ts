import type { ValueOf } from 'type-fest'

export const ResourceActionType = {
	List: 'list',
	Create: 'create',
	Edit: 'edit',
	Show: 'show',
} as const

export type ResourceActionTypeValues = ValueOf<typeof ResourceActionType>

export type ResourceActionForForm = Extract<ResourceActionTypeValues, 'create' | 'edit' | 'clone'>
