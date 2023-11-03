import type { Ref } from 'vue-demi'
import { computed, reactive, unref, watch } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { ListParams, PartialListParams } from '@ginjou/controller'
import { createListParams } from '@ginjou/controller'
import { eventRef } from '@bouzu/vue-helper'
import { computedWirteEager } from '../helper/computed-eager'

export interface UseListParamsProps {
	pagination?: MaybeRef<PartialListParams['pagination']>
	filters?: MaybeRef<PartialListParams['filters']>
	sorters?: MaybeRef<PartialListParams['sorters']>
}

export interface UseListParamsResult {
	page: Ref<ListParams['pagination']['current']>
	perPage: Ref<ListParams['pagination']['perPage']>
	pagination: Ref<ListParams['pagination']>
	filters: Ref<ListParams['filters']>
	sorters: Ref<ListParams['sorters']>
}

export function useListParams(
	props: UseListParamsProps = {},
): UseListParamsResult {
	const initParams = reactive({
		pagination: props.pagination,
		filters: props.filters,
		sorters: props.sorters,
	})
	const params = createListParams(initParams)
	const [value] = eventRef<ListParams, (e: { value: ListParams }) => void>({
		register: (handler) => {
			params.on('change', handler)
			return () => params.off('change', handler)
		},
		get: event => event?.value ?? params.getValue(),
	})

	const pagination = computed<ListParams['pagination']>({
		get: () => unref(value).pagination,
		set: val => params.setPagination(val),
	})

	const filters = computed<ListParams['filters']>({
		get: () => unref(value).filters,
		set: val => params.setFilters(val),
	})

	const sorters = computed<ListParams['sorters']>({
		get: () => unref(value).sorters,
		set: val => params.setSorters(val),
	})

	const page = computedWirteEager<ListParams['pagination']['current']>({
		get: () => unref(pagination).current,
		set: val => params.setPage(val),
	})

	const perPage = computedWirteEager<ListParams['pagination']['perPage']>({
		get: () => unref(pagination).perPage,
		set: val => params.setPerPage(val),
	})

	watch(initParams, (val) => {
		params.setValue(val)
	}, { flush: 'sync' })

	return {
		page,
		perPage,
		pagination,
		filters,
		sorters,
	}
}
