import type { ResourceDefinition } from './definition'

export interface Resource<
	TResourceMeta extends Record<string, any> = Record<string, any>,
> {
	resources: ResourceDefinition<TResourceMeta>[]
}
