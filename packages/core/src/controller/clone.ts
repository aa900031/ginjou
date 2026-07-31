import type { SetOptional } from 'type-fest'
import type { BaseRecord, CreateResult, Meta, Params, RecordKey } from '../query'
import type { Props as CreateProps } from '../query/create'
import type { Props as GetOneProps } from '../query/get-one'
import type { SaveFn, SaveFnParams } from './create'
import type { RedirectOptions } from './redirect-to'
import { createSaveFn as createCreateSaveFn } from './create'
import * as Resource from './resource'
import * as ResourceAction from './resource-action'

export type { SaveFn, SaveFnParams }

export type Props<
	TQueryData extends BaseRecord,
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = SetOptional<
	& Omit<
		CreateProps<TMutationData, TMutationError, TMutationParams>,
		'params'
	>
	& {
		id: RecordKey
		redirect?: RedirectOptions<CreateResult<TMutationData>>
		queryMeta?: Meta
		queryOptions?: GetOneProps<TQueryData, TQueryError, TQueryResultData>['queryOptions']
	},
	| 'resource'
	| 'id'
>

export interface GetIdProps {
	resource: Resource.Resolved | undefined
	idFromProp: RecordKey | undefined
}

export function getId(
	{
		resource,
		idFromProp,
	}: GetIdProps,
): RecordKey | undefined {
	return Resource.getIdForAction({
		resource,
		action: ResourceAction.Type.Clone,
		idFromProp,
	})
}

export interface GetIsLoadingParams {
	isQueryFetching: boolean
	isCreatePending: boolean
}

export function getIsLoading(
	{
		isQueryFetching,
		isCreatePending,
	}: GetIsLoadingParams,
): boolean {
	return isQueryFetching || isCreatePending
}

export function createSaveFn<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
>(
	params: SaveFnParams<TMutationData, TMutationParams, TMutationError>,
): SaveFn<TMutationData, TMutationParams> {
	const save = createCreateSaveFn(params)

	return async function saveFn(mutationParams) {
		// The source record's id must never reach createOne, or the backend either
		// rejects the duplicate key or overwrites the record being cloned.
		const { id: _id, ...params } = mutationParams ?? {}
		return save(params as TMutationParams)
	}
}
