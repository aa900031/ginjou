import type { Simplify } from 'type-fest'
import type { BaseRecord, GetOne, RecordKey } from '../query'
import type * as Resource from './resource'

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& GetOne.Props<TData, TError, TResultData>
>

export interface GetDefaultIdProps {
	resourceFromProp: string | undefined
	idFromProp: RecordKey | undefined
	resource: Resource.Resolved | undefined
	inferredResource: Resource.Resolved | undefined
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
