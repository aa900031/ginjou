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
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError,
> = ToMaybeRefs<
	Create.Props<TMutationParams, TMutationData, TMutationError>
>

export type UseCreateContext = Simplify<
	& UseResourceContext
	& UseCreateOneContext
	& UseGoContext
	& UseNavigateToContext
>

export type UseCreateResult<
	TMutationParams extends Params,
	TMutationData extends BaseRecord,
	TMutationError = unknown,
> = Simplify<
	& UseCreateOneResult<TMutationData, TMutationError, TMutationParams>
	& {
		isLoading: Ref<boolean>
		save: Create.SaveFn<TMutationParams, TMutationData>
	}
>

export function useCreate<
	TMutationParams extends Params = Params,
	TMutationData extends BaseRecord = BaseRecord,
	TMutationError = unknown,
>(
	props?: UseCreateProps<TMutationParams, TMutationData, TMutationError>,
	context?: UseCreateContext,
): UseCreateResult<TMutationParams, TMutationData, TMutationError> {
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

	const save = Create.createSaveFn<TMutationParams, TMutationData, TMutationError>({
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
