import type { Simplify } from 'type-fest'
import type { BaseRecord, GetOne, RecordKey } from '../query'
import * as Resource from './resource'
import * as ResourceAction from './resource-action'

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

	return Resource.getIdForAction({
		resource,
		action: ResourceAction.Type.Show,
		idFromProp,
	})
}
