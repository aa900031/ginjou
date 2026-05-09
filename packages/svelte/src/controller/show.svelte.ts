import type { BaseRecord, RecordKey } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetOneContext, UseGetOneResult } from '../query'
import type { UseResourceContext } from '../resource'
import type { MaybeAccessor } from '../utils'
import { getFetcherName, getResourceIdentifier, Show } from '@ginjou/core'
import { useGetOne } from '../query'
import { useResource } from '../resource'
import { extract, watch, withAccessors } from '../utils'

export type UseShowProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = MaybeAccessor<
	| Show.Props<TData, TError, TResultData>
	| undefined
>

export type UseShowContext = Simplify<
	& UseResourceContext
	& UseGetOneContext
>

export type UseShowResult<
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& UseGetOneResult<TError, TResultData>
	& {
		id: RecordKey | undefined
	}
>

export function useShow<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props?: UseShowProps<TData, TError, TResultData>,
	context?: UseShowContext,
): UseShowResult<TError, TResultData> {
	const resolvedProps = $derived(extract(props))
	const resource = useResource(() => ({ name: resolvedProps?.resource }), context)
	const inferredResource = useResource(undefined, context)

	const resourceName = $derived.by(() => getResourceIdentifier({
		resource: resource.value,
		resourceFromProp: resolvedProps?.resource,
	}))
	const fetcherName = $derived.by(() => getFetcherName({
		resource: resource.value,
		fetcherNameFromProp: resolvedProps?.fetcherName,
	}))
	const defaultId = $derived.by(() => Show.getDefaultId({
		resourceFromProp: resolvedProps?.resource,
		idFromProp: resolvedProps?.id,
		resource: resource.value,
		inferredResource: inferredResource.value,
	}))

	let id = $state<RecordKey | undefined>()
	watch(() => defaultId, (value) => {
		id = value
	}, { immediate: true }) // If remove `immediate` the svelte compiler will warning: `This reference only captures the initial value of `defaultId`. Did you mean to reference it inside a closure instead? https://svelte.dev/e/state_referenced_locally`

	const result = useGetOne<TData, TError, TResultData>(() => ({
		...resolvedProps,
		resource: resourceName,
		id,
		fetcherName,
	}), context)

	return withAccessors(result, {
		id: { get: () => id, set: v => (id = v) },
	})
}
