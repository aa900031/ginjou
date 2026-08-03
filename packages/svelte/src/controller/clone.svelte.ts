import type { BaseRecord, Params } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseCreateOneContext, UseCreateOneResult, UseGetOneContext, UseGetOneResult } from '../query'
import type { UseGoContext, UseNavigateToContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { Clone, Resource } from '@ginjou/core'
import { useCreateOne, useGetOne } from '../query'
import { useNavigateTo } from '../router'
import { extract, unbox, withAccessors } from '../utils'
import { useResource } from './resource.svelte'

export type UseCloneProps<
	TQueryData extends BaseRecord,
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = MaybeAccessor<
	| Clone.Props<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>
	| undefined
>

export type UseCloneContext = Simplify<
	& UseResourceContext
	& UseGetOneContext
	& UseCreateOneContext
	& UseGoContext
	& UseNavigateToContext
>

export type UseCloneResult<
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError = unknown,
> = Simplify<
	& UseCreateOneResult<TMutationData, TMutationError, TMutationParams>
	& Pick<UseGetOneResult<TQueryError, TQueryResultData>, 'record'>
	& {
		query: UseGetOneResult<TQueryError, TQueryResultData>
		readonly isLoading: boolean
		save: Clone.SaveFn<TMutationData, TMutationParams>
	}
>

export function useClone<
	TQueryData extends BaseRecord = BaseRecord,
	TMutationParams extends Params = TQueryData,
	TQueryError = unknown,
	TQueryResultData extends BaseRecord = TQueryData,
	TMutationData extends BaseRecord = TQueryResultData,
	TMutationError = unknown,
>(
	props?: UseCloneProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
	context?: UseCloneContext,
): UseCloneResult<TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError> {
	const resolvedProps = $derived(extract(props))
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)
	const navigateTo = useNavigateTo(() => ({ resource: resolvedProps?.resource }), context)

	const id = $derived.by(() => Clone.getId({
		resource: unbox(resource),
		idFromProp: resolvedProps?.id,
	}))
	const fetcherName = $derived.by(() => Resource.getFetcherName({
		resource: unbox(resource),
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))
	const resourceName = $derived.by(() => Resource.getName({
		resource: unbox(resource),
		resourceFromProp: resolvedProps?.resource,
	}))

	const query = useGetOne<TQueryData, TQueryError, TQueryResultData>(() => ({
		resource: resourceName,
		id,
		fetcherName,
		meta: resolvedProps?.queryMeta,
		queryOptions: resolvedProps?.queryOptions,
	}), context)

	const mutation = useCreateOne<TMutationData, TMutationParams, TMutationError>(() => {
		const { id: _id, ...createProps } = resolvedProps ?? {}
		return {
			...createProps,
			resource: resourceName,
			fetcherName,
		}
	}, context)

	const isLoading = $derived.by(() => Clone.getIsLoading({
		isQueryFetching: query.isFetching,
		isCreatePending: mutation.isPending,
	}))

	const save = Clone.createSaveFn<TMutationData, TMutationParams, TMutationError>({
		navigateTo,
		getResourceName: () => resourceName,
		getRedirect: () => resolvedProps?.redirect,
		mutateFn: (variables, options) => mutation.mutateAsync(variables!, options),
	})

	return withAccessors(mutation, {
		record: () => query.record,
		isLoading: () => isLoading,
		query: () => query,
		save: () => save,
	})
}
