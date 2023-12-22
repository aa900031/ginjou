import type { Simplify } from 'type-fest'
import type { Resource } from './resource'
import type { ResourceActionTypeValues } from './action'
import type { ResourceParseFn } from './parse'

export interface ResourceActionParse {
	pattern: string
	parse: ResourceParseFn
}

export type ResourceDefinition<
	TMetaExtends extends Record<string, any> = Record<string, any>,
> = Simplify<
	& Partial<Record<
			ResourceActionTypeValues,
			| string
			| ResourceActionParse
		>>
	& {
		name: string
		meta?: ResourceDefinitionMeta<TMetaExtends>
	}
>

export type ResourceDefinitionMeta<
	TMetaExtends extends Record<string, any> = Record<string, any>,
> = Simplify<
	& {
		parent?: string
		hide?: boolean
		deletable?: boolean
		fetcherName?: string
	}
	& TMetaExtends
>

export function getResourceDefinition<
	TResourceMeta extends Record<string, any> = Record<string, any>,
>(
	binding: Resource<TResourceMeta>,
	name: string | undefined,
): ResourceDefinition<TResourceMeta> | undefined {
	if (!name)
		return

	const map = getResourceDefinitionMap(binding)
	return map?.get(name)
}

const cached = new WeakMap<ResourceDefinition[], Map<string, ResourceDefinition>>()

function getResourceDefinitionMap<
	TResourceMeta extends Record<string, any> = Record<string, any>,
>(
	binding: Resource<TResourceMeta>,
): Map<string, ResourceDefinition<TResourceMeta>> | undefined {
	if (!binding?.resources)
		return

	const cache = cached.get(binding.resources) as Map<string, ResourceDefinition<TResourceMeta>>
	if (cache)
		return cache

	const map = new Map<string, ResourceDefinition<TResourceMeta>>()
	cached.set(binding.resources, map)

	map.clear()
	for (const resource of binding.resources) {
		const key = [resource.name].join('-')
		map.set(key, resource)
	}

	return map
}
