import type { BaseRecord, Params } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseCreateOneContext, UseCreateOneResult } from '../query'
import type { UseGoContext, UseNavigateToContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContext } from './resource.svelte'
import { Create, Resource } from '@ginjou/core'
import { useCreateOne } from '../query'
import { useNavigateTo } from '../router'
import { extract, withAccessors } from '../utils'
import { useResource } from './resource.svelte'

export type UseCreateProps<
	TMutationData extends BaseRecord,
	TMutationParams extends Params,
	TMutationError,
> = MaybeAccessor<
	| Create.Props<TMutationData, TMutationParams, TMutationError>
	| undefined
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
		readonly isLoading: boolean
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
	const resolvedProps = $derived(extract(props))
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)
	const navigateTo = useNavigateTo(() => ({ resource: resolvedProps?.resource }), context)

	const fetcherName = $derived.by(() => Resource.getFetcherName({
		resource: resource.value,
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))
	const resourceName = $derived.by(() => Resource.getName({
		resource: resource.value,
		resourceFromProp: resolvedProps?.resource,
	}))

	const mutation = useCreateOne<TMutationData, TMutationParams, TMutationError>(() => ({
		...resolvedProps,
		resource: resourceName,
		fetcherName,
	}), context)

	const isLoading = $derived.by(() => Create.getIsLoading({
		isPending: mutation.isPending,
	}))

	const save = Create.createSaveFn<TMutationData, TMutationParams, TMutationError>({
		navigateTo,
		getResourceName: () => resourceName,
		getRedirect: () => resolvedProps?.redirect,
		mutateFn: (variables, options) => mutation.mutateAsync(variables!, options),
	})

	return withAccessors(mutation, {
		isLoading: () => isLoading,
		save: () => save,
	})
}
