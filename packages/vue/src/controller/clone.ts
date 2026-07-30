import type { BaseRecord, Params } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseCreateOneContext, UseCreateOneResult, UseGetOneContext, UseGetOneResult } from '../query'
import type { UseGoContext, UseNavigateToContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseResourceContext } from './resource'
import { Clone, Resource } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useCreateOne, useGetOne } from '../query'
import { useNavigateTo } from '../router'
import { useResource } from './resource'

export type UseCloneProps<
	TQueryData extends BaseRecord,
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = ToMaybeRefs<
	Clone.Props<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>
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
		isLoading: Ref<boolean>
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
	const resource = useResource({ name: props?.resource }, context)
	const navigateTo = useNavigateTo(props, context)

	const id = computed(() => Clone.getId({
		resource: unref(resource),
		idFromProp: unref(props?.id),
	}))
	const fetcherName = computed(() => Resource.getFetcherName({
		resource: unref(resource),
		fetcherNameFromProp: unref(props?.fetcherName),
	}))
	const resourceName = computed(() => Resource.getName({
		resource: unref(resource),
		resourceFromProp: unref(props?.resource),
	}))

	const query = useGetOne<TQueryData, TQueryError, TQueryResultData>({
		resource: resourceName,
		id,
		fetcherName,
		meta: props?.queryMeta,
		queryOptions: props?.queryOptions,
	}, context)

	const mutation = useCreateOne<TMutationData, TMutationParams, TMutationError>({
		...props,
		resource: resourceName,
		fetcherName,
	}, context)

	const isLoading = computed(() => Clone.getIsLoading({
		isQueryFetching: unref(query.isFetching),
		isCreatePending: unref(mutation.isPending),
	}))

	const save = Clone.createSaveFn<TMutationData, TMutationParams, TMutationError>({
		navigateTo,
		getResourceName: () => unref(resourceName),
		getRedirect: () => unref(props?.redirect),
		mutateFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		record: query.record,
		isLoading,
		query,
		save,
	}
}
