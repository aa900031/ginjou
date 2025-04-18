import type { Simplify } from 'type-fest'
import type { RouterLocation } from '../router'
import type { ResourceDefinition } from './definition'
import type { ResourceParseResult } from './parse'
import type { Resource } from './resource'
import { getResourceDefinition } from './definition'
import { parseResource } from './parse'

export type ResolvedResource<
	TResourceMeta extends Record<string, any> = Record<string, any>,
> = Simplify<
	& ResourceParseResult
	& {
		resource: ResourceDefinition<TResourceMeta>
	}
>

export interface ResolveResourceParams<
	TLocationMeta = unknown,
> {
	name?: string
	location?: RouterLocation<TLocationMeta>
}

export function resolveResource<
	TResourceMeta extends Record<string, any> = Record<string, any>,
	TLocationMeta = unknown,
>(
	binding: Resource<TResourceMeta> | undefined,
	params: ResolveResourceParams<TLocationMeta>,
): ResolvedResource<TResourceMeta> | undefined {
	if (!binding)
		return

	if (params.name) {
		const definition = getResourceDefinition<TResourceMeta>(binding, params.name)
		if (definition) {
			return {
				resource: definition,
				...(
					params.location
						? parseResource(definition, params.location)
						: undefined
				),
			} as ResolvedResource<TResourceMeta>
		}
	}

	if (params.location) {
		for (const definition of binding.resources) {
			const parsed = parseResource(definition, params.location)
			if (parsed) {
				return {
					resource: definition,
					...parsed,
				}
			}
		}
	}
}
