import type { BaseRecord, Params } from '@ginjou/core'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseCreateOneContext, UseCreateOneResult } from '../query'
import type { UseGoContext, UseNavigateToContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseResourceContext } from './resource'
import type { UseWarnUnsavedContext } from './warn-unsaved'
import { Create, Resource, WarnUnsaved } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useCreateOne } from '../query'
import { useNavigateTo } from '../router'
import { useResource } from './resource'
import { useWarnUnsaved } from './warn-unsaved'

export type UseCreateProps<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
> = Simplify<
	& ToMaybeRefs<
		Create.Props<TMutationData, TMutationParams, TMutationError>
	>
	& {
		warnUnsaved?: MaybeRef<WarnUnsaved.Prop>
	}
>

export type UseCreateContext = Simplify<
	& UseResourceContext
	& UseCreateOneContext
	& UseGoContext
	& UseNavigateToContext
	& UseWarnUnsavedContext
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
		warnUnsavedActive: Ref<boolean>
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

	const fetcherName = computed(() => Resource.getFetcherName({
		resource: unref(resource),
		fetcherNameFromProp: unref(props?.fetcherName),
	}))
	const resourceName = computed(() => Resource.getName({
		resource: unref(resource),
		resourceFromProp: unref(props?.resource),
	}))

	const mutation = useCreateOne<TMutationData, TMutationParams, TMutationError>({
		...props,
		resource: resourceName,
		fetcherName,
	}, context)

	const isLoading = computed(() => Create.getIsLoading({
		isPending: unref(mutation.isPending),
	}))

	const { active: warnUnsavedActive } = useWarnUnsaved({
		enabled: computed(() => WarnUnsaved.getPropsEnabledFromProp(unref(props?.warnUnsaved))),
		confirm: computed(() => WarnUnsaved.getPropsConfirmFromProp(unref(props?.warnUnsaved))),
	}, context)

	const save = Create.createSaveFn<TMutationData, TMutationParams, TMutationError>({
		navigateTo,
		getResourceName: () => unref(resourceName),
		getRedirect: () => unref(props?.redirect),
		mutateFn: mutation.mutateAsync,
		setWarnUnsavedActive: (value) => {
			warnUnsavedActive.value = value
		},
	})

	return {
		...mutation,
		isLoading,
		save,
		warnUnsavedActive,
	}
}
