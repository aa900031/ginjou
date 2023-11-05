import type { Simplify } from 'type-fest'
import { useGetOne, useUpdate } from '@ginjou/vue-query'
import type { UseGetOneResult, UseUpdateContext, UseUpdateProps } from '@ginjou/vue-query'
import type { BaseRecord, UpdateMutationProps } from '@ginjou/query'
import { type MaybeRef, computed, unref } from 'vue-demi'
import { type SaveEditFn, createSaveEditFn } from '@ginjou/controller'
import { includeKeys } from 'filter-obj'
import type { RecordMaybeRef } from '../helper/types'
import type { Save } from '../save/save'
import { pickUnrefs } from '../helper/pick-unrefs'

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

export type UseEditResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> = Simplify<
	& Save<SaveEditFn<TData, TError, TParams>>
	& Pick<UseGetOneResult<TData, TError, TParams>, typeof PICK_ONE_FILEDS[number]>
>

export function useEdit<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: UseEditProps<TData, TError, TParams>,
	context?: UseEditContext,
): UseEditResult<TData, TError, TParams> {
	const one = useGetOne<TData, TError, TParams>({
		...props,
		queryOptions: computed(() => ({
			refetchOnReconnect: false,
			refetchOnWindowFocus: false,
			retry: false,
		})),
	}, context)
	const update = useUpdate<TData, TError, TParams>(props, context)
	const save = createSaveEditFn<TData, TError, TParams>({
		mutate: update,
		getProps: values => ({
			// eslint-disable-next-line ts/no-use-before-define
			...pickUnrefs(props, PICK_PROPS_FIELDS),
			resource: unref(props.resource),
			params: values,
		}),
		getOptions: () => unref(props.mutationOptions),
	})

	// TODO: return resource
	// TODO: return redirect
	// TODO: notify when success or error
	// TODO: defer, mutationMode

	return {
		// eslint-disable-next-line ts/no-use-before-define
		...includeKeys(one, PICK_ONE_FILEDS),
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
