import type { BaseRecord, Params } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseCreateOneContext, UseCreateOneResult } from '../query'
import type { UseResourceContext } from '../resource'
import type { UseGoContext, UseNavigateToContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import { Create, getFetcherName, getResourceIdentifier } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useCreateOne } from '../query'
import { useResource } from '../resource'
import { useNavigateTo } from '../router'

export type UseCreateProps<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
> = ToMaybeRefs<
	Create.Props<TMutationData, TMutationParams, TMutationError>
>

export type UseCreateContext = Simplify<
	& UseResourceContext
	& UseCreateOneContext
	& UseGoContext
	& UseNavigateToContext
>

export type UseCreateResult<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError = unknown,
> = Simplify<
	& UseCreateOneResult<TMutationData, TMutationError, TMutationParams>
	& {
		isLoading: Ref<boolean>
		save: Create.SaveFn<TMutationData, TMutationParams>
	}
>

export function useCreate<
	TMutationData extends BaseRecord = BaseRecord,
	TMutationParams extends Params = TMutationData,
	TMutationError = unknown,
>(
	props?: UseCreateProps<TMutationData, TMutationParams, TMutationError>,
	context?: UseCreateContext,
): UseCreateResult<TMutationData, TMutationParams, TMutationError> {
	const resource = useResource({ name: props?.resource }, context)
	const navigateTo = useNavigateTo(props, context)

	const fetcherName = computed(() => getFetcherName({
		resource: unref(resource),
		fetcherNameFromProp: unref(props?.fetcherName),
	}))
	const resourceName = computed(() => getResourceIdentifier({
		resource: unref(resource),
		resourceFromProp: unref(props?.resource),
	}))

	const mutation = useCreateOne<TMutationData, TMutationParams, TMutationError>({
		...props,
		resource: resourceName,
		fetcherName,
		meta: props?.mutationMeta,
	}, context)

	const isLoading = computed(() => Create.getIsLoading({
		isPending: unref(mutation.isPending),
	}))

	const save = Create.createSaveFn<TMutationData, TMutationParams, TMutationError>({
		navigateTo,
		getResourceName: () => unref(resourceName),
		getRedirect: () => unref(props?.redirect),
		mutateFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		isLoading,
		save,
	}
}
