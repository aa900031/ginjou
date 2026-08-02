import type { BaseRecord, Params } from '@ginjou/core'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseGetOneContext, UseGetOneResult, UseUpdateOneContext, UseUpdateOneResult } from '../query'
import type { UseGoContext, UseNavigateToContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseResourceContext } from './resource'
import type { UseWarnUnsavedContext } from './warn-unsaved'
import { Edit, Resource, WarnUnsaved } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useGetOne, useUpdateOne } from '../query'
import { useNavigateTo } from '../router'
import { useResource } from './resource'
import { useWarnUnsaved } from './warn-unsaved'

export type UseEditProps<
	TQueryData extends BaseRecord,
	TMutationParams extends Params,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = Simplify<
	& ToMaybeRefs<
		Edit.Props<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>
	>
	& {
		warnUnsaved?: MaybeRef<WarnUnsaved.Prop>
	}
>

export type UseEditContext = Simplify<
	& UseResourceContext
	& UseGetOneContext
	& UseUpdateOneContext
	& UseGoContext
	& UseNavigateToContext
	& UseWarnUnsavedContext
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
		isLoading: Ref<boolean>
		save: Edit.SaveFn<TMutationParams, TMutationData>
		warnUnsavedActive: Ref<boolean>
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
	const { warnUnsaved, ...mutationProps } = props ?? {}

	const resource = useResource({ name: props?.resource }, context)
	const navigateTo = useNavigateTo(props, context)

	const id = computed(() => Edit.getId({
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

	const mutation = useUpdateOne<TMutationData, TMutationParams, TMutationError>({
		...mutationProps,
		resource: resourceName,
		id,
		fetcherName,
	}, context)

	const isLoading = computed(() => Edit.getIsLoading({
		isQueryFetching: unref(query.isFetching),
		isUpdatePending: unref(mutation.isPending),
	}))

	const { active: warnUnsavedActive } = useWarnUnsaved({
		enabled: computed(() => WarnUnsaved.getPropsEnabledFromProp(unref(warnUnsaved))),
		confirm: computed(() => WarnUnsaved.getPropsConfirmFromProp(unref(warnUnsaved))),
	}, context)

	const save = Edit.createSaveFn<TMutationParams, TMutationData, TMutationError, TQueryResultData>({
		getId: () => unref(id),
		getResourceName: () => unref(resourceName),
		getMutationMode: () => unref(props?.mutationMode),
		getRedirect: () => unref(props?.redirect),
		getQueryData: () => unref(query.data),
		navigateTo,
		mutateFn: mutation.mutateAsync,
		setWarnUnsavedActive: (value) => {
			warnUnsavedActive.value = value
		},
	})

	return {
		...mutation,
		record: query.record,
		isLoading,
		query,
		save,
		warnUnsavedActive,
	}
}
