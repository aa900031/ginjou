import type { BaseRecord, RecordKey } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseGetOneContext, UseGetOneResult } from '../query'
import type { UseResourceContext } from '../resource'
import type { MaybeAccessor } from '../utils'
import { getFetcherName, getResourceIdentifier, Show } from '@ginjou/core'
import { useGetOne } from '../query'
import { useResource } from '../resource'
import { extract, watch } from '../utils'

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

	let id = $state<RecordKey | undefined>(defaultId)
	watch(() => defaultId, (value) => {
		id = value
	})

	const result = useGetOne<TData, TError, TResultData>(() => ({
		...resolvedProps,
		resource: resourceName,
		id,
		fetcherName,
	}), context)

	Object.assign(result, {
		get id(): RecordKey | undefined {
			return id
		},
		set id(value: RecordKey | undefined) {
			id = value
		},
	})

	return result as UseShowResult<TError, TResultData>
}
