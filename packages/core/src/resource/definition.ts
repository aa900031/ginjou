import type { Simplify } from 'type-fest'
import type { ResourceActionDefinitions } from './action'

export type ResourceDefinition<
	TMetaExtends extends Record<string, any> = Record<string, any>,
> = Simplify<
	& ResourceActionDefinitions
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

export function getResourceFetcherName(
	target: ResourceDefinition | undefined,
): string | undefined {
	return target?.meta?.fetcherName
}
