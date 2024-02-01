import type { Simplify } from 'type-fest'
import type { BaseRecord, GetOne, RecordKey } from '../query'
import type { ResolvedResource } from '../resource'

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& GetOne.Props<TData, TError, TResultData>
>

export interface GetResourceNameProps {
	resource: ResolvedResource | undefined
}

export function getResourceName(
	{
		resource,
	}: GetResourceNameProps,
): string | undefined {
	return resource?.resource.name
}

export interface GetDefaultIdProps {
	resourceFromProp: string | undefined
	idFromProp: RecordKey | undefined
	resource: ResolvedResource | undefined
	inferredResource: ResolvedResource | undefined
}

export function getDefaultId(
	{
		idFromProp,
		resourceFromProp,
		resource,
		inferredResource,
	}: GetDefaultIdProps,
): RecordKey | undefined {
	if (resourceFromProp && resourceFromProp !== inferredResource?.resource.name)
		return idFromProp

	const idFromResource = resource?.action === 'show' ? resource.id : undefined
	return idFromProp ?? idFromResource
}
