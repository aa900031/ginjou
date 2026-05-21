import type * as Resource from './resource'

export interface Controller<
	TResourceMeta extends Record<string, any> = Record<string, any>,
> {
	resources?: Resource.Raw<TResourceMeta>[]
}

/* @__NO_SIDE_EFFECTS__ */
export function defineController<
	T extends Controller,
>(
	value: T,
): T {
	return value
}
