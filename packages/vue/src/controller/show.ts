import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, ref, unref, watch } from 'vue-demi'
import { Show } from '@ginjou/core'
import type { BaseRecord, RecordKey } from '@ginjou/core'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseGetOneContext, UseGetOneResult } from '../query'
import { useGetOne } from '../query'
import type { UseResourceContext } from '../resource'
import { useResource } from '../resource'

export type UseShowProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = ToMaybeRefs<
	Show.Props<TData, TError, TResultData>
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
		id: Ref<RecordKey | undefined>
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
	const resource = useResource({ name: props?.resource }, context)
	const inferredResource = useResource(undefined, context)
	const resourceName = computed(() => Show.getResourceName({
		resource: unref(resource),
	}))
	const defaultId = computed(() => Show.getDefaultId({
		resourceFromProp: unref(props?.resource),
		idFromProp: unref(props?.id),
		resource: unref(resource),
		inferredResource: unref(inferredResource),
	}))
	const id = ref<RecordKey | undefined>(unref(defaultId))

	const result = useGetOne<TData, TError, TResultData>({
		...props,
		resource: resourceName,
		id,
	})

	watch(defaultId, (val) => {
		id.value = val
	}, { flush: 'sync' })

	return {
		...result,
		id,
	}
}
