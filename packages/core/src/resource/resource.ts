import type { ResourceDefinition } from './definition'

export interface Resource<
	TResourceMeta extends Record<string, any> = Record<string, any>,
> {
	resources: ResourceDefinition<TResourceMeta>[]
}

/* @__NO_SIDE_EFFECTS__ */
export function defineResource<
	T extends Resource,
>(
	value: T,
): T {
	return value
}
