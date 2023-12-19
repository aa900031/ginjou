import type { Simplify } from 'type-fest'
import { createSaveEditFn, getEditRecord, handleEditGetOneError } from '@ginjou/core'
import type { BaseRecord, SaveEditFn, UpdateMutationProps } from '@ginjou/core'
import { computed, unref, watch } from 'vue-demi'
import type { ComputedRef } from 'vue-demi'
import { includeKeys } from 'filter-obj'
import type { MaybeRef } from '@vueuse/shared'
import type { UseGetOneResult, UseUpdateContext, UseUpdateProps } from '../../query'
import { useGetOne, useUpdate } from '../../query'
import type { RecordMaybeRef } from '../helper/types'
import type { Save } from '../save/save'
import { pickUnrefs } from '../helper/pick-unrefs'
import type { UseNotifyContext } from '../../notification'
import { useNotify } from '../../notification'
import type { UseGoContext } from '../../router'
import { useGo } from '../../router'

export type UseEditProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> = Simplify<
	& UseUpdateProps<TData, TError, TParams>
	& RecordMaybeRef<Pick<UpdateMutationProps<TParams>, typeof PICK_PROPS_FIELDS[number]>>
	& {
		resource: MaybeRef<string>
	}
>

export type UseEditContext =
	& UseUpdateContext
	& UseNotifyContext
	& UseGoContext

export type UseEditResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& Save<SaveEditFn<TData, TError, TParams>>
	& Pick<UseGetOneResult<TData, TError, TResultData>, typeof PICK_ONE_FILEDS[number]>
	& {
		record: ComputedRef<TResultData | undefined>
	}
>

export function useEdit<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
	TResultData extends BaseRecord = TData,
>(
	props: UseEditProps<TData, TError, TParams>,
	context?: UseEditContext,
): UseEditResult<TData, TError, TParams, TResultData> {
	const go = useGo(context)
	const notify = useNotify(context)

	const one = useGetOne<TData, TError, TResultData>({
		...props,
		queryOptions: computed(() => ({
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
			retry: false,
		})),
	}, context)
	const update = useUpdate<TData, TError, TParams>(props, context)

	const save = createSaveEditFn<TData, TError, TParams>({
		notify,
		go,
		mutate: update,
		getProps: values => ({
			// eslint-disable-next-line ts/no-use-before-define
			...pickUnrefs(props, PICK_PROPS_FIELDS),
			resource: unref(props.resource),
			params: values,
		}),
		getOptions: () => unref(props.mutationOptions),
	})

	const record = computed(() => getEditRecord({
		result: unref(one.data),
	}))

	watch(one.error, error => handleEditGetOneError({
		error,
		notify,
		go,
	}))

	// TODO: return resource
	// TODO: return redirect
	// TODO: defer, mutationMode

	return {
		// eslint-disable-next-line ts/no-use-before-define
		...includeKeys(one, PICK_ONE_FILEDS),
		record,
		save,
		isSaving: update.isLoading,
	}
}

const PICK_PROPS_FIELDS = [
	'id',
	'meta',
	'fetcherName',
	'invalidates',
] as const

const PICK_ONE_FILEDS = [
	'error',
	'isFetching',
	'isLoading',
	'refetch',
] as const
