import type { BaseRecord, Params } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetOneContext, UseGetOneResult, UseUpdateOneContext, UseUpdateOneResult } from '../query'
import type { UseResourceContext } from '../resource'
import type { UseGoContext, UseNavigateToContext } from '../router'
import type { MaybeAccessor } from '../utils'
import { Edit, getFetcherName, getResourceIdentifier } from '@ginjou/core'
import { useGetOne, useUpdateOne } from '../query'
import { useResource } from '../resource'
import { useNavigateTo } from '../router'
import { extract, withAccessors } from '../utils'

export type UseEditProps<
	TQueryData extends BaseRecord,
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = MaybeAccessor<
	| Edit.Props<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>
	| undefined
>

export type UseEditContext = Simplify<
	& UseResourceContext
	& UseGetOneContext
	& UseUpdateOneContext
	& UseGoContext
	& UseNavigateToContext
>

export type UseEditResult<
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError = unknown,
> = Simplify<
	& UseUpdateOneResult<TMutationData, TMutationError, TMutationParams>
	& Pick<
		UseGetOneResult<TQueryError, TQueryResultData>,
		| 'record'
	>
	& {
		query: UseGetOneResult<TQueryError, TQueryResultData>
		readonly isLoading: boolean
		save: Edit.SaveFn<TMutationParams, TMutationData>
	}
>

export function useEdit<
	TQueryData extends BaseRecord = BaseRecord,
	TMutationParams extends Params = TQueryData,
	TQueryError = unknown,
	TQueryResultData extends BaseRecord = TQueryData,
	TMutationData extends BaseRecord = TQueryResultData,
	TMutationError = unknown,
>(
	props?: UseEditProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
	context?: UseEditContext,
): UseEditResult<TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError> {
	const resolvedProps = $derived(extract(props))
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)
	const navigateTo = useNavigateTo(() => ({ resource: resolvedProps?.resource }), context)

	const id = $derived.by(() => Edit.getId({
		resource: resource.value,
		idFromProp: resolvedProps?.id,
	}))
	const fetcherName = $derived.by(() => getFetcherName({
		resource: resource.value,
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))
	const resourceName = $derived.by(() => getResourceIdentifier({
		resource: resource.value,
		resourceFromProp: resolvedProps?.resource,
	}))

	const query = useGetOne<TQueryData, TQueryError, TQueryResultData>(() => ({
		resource: resourceName,
		id,
		fetcherName,
		meta: resolvedProps?.queryMeta,
		queryOptions: resolvedProps?.queryOptions,
	}), context)

	const mutation = useUpdateOne<TMutationData, TMutationParams, TMutationError>(() => ({
		...resolvedProps,
		resource: resourceName,
		id,
		fetcherName,
	}), context)

	const isLoading = $derived.by(() => Edit.getIsLoading({
		isQueryFetching: query.isFetching,
		isUpdatePending: mutation.isPending,
	}))

	const save = Edit.createSaveFn<TMutationParams, TMutationData, TMutationError, TQueryResultData>({
		getId: () => id,
		getResourceName: () => resourceName,
		getMutationMode: () => resolvedProps?.mutationMode,
		getRedirect: () => resolvedProps?.redirect,
		getQueryData: () => query.data,
		navigateTo,
		mutateFn: (variables, options) => mutation.mutateAsync(variables!, options),
	})

	return withAccessors(mutation, {
		record: () => query.record,
		isLoading: () => isLoading,
		query: () => query,
		save: () => save,
	})
}
