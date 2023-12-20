import type { ResourceDefinition } from './definition'

export interface Resource {
	resources: ResourceDefinition[]
}

const cached = new WeakMap<ResourceDefinition[], Map<string, ResourceDefinition>>()

export function getResourceDefinitionMap(
	binding: Resource | undefined,
): Map<string, ResourceDefinition> | undefined {
	if (!binding?.resources)
		return

	const cache = cached.get(binding.resources)
	if (cache)
		return cache

	const map = new Map<string, ResourceDefinition>()
	cached.set(binding.resources, map)

	map.clear()
	for (const resource of binding.resources) {
		const key = [resource.name].join('-')
		map.set(key, resource)
	}

	return map
}

export function getResourceDefinition(
	binding: Resource | undefined,
	name: string | undefined,
): ResourceDefinition | undefined {
	if (!name)
		return

	const map = getResourceDefinitionMap(binding)
	return map?.get(name)
}
