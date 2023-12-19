import type { Ref } from 'vue-demi'
import { unref } from 'vue-demi'
import type { Simplify } from 'type-fest'
import type { MaybeRef } from '@vueuse/shared'
import type { BaseRecord, CreateMutationProps, SaveCreateFn } from '@ginjou/core'
import { createSaveCreateFn } from '@ginjou/core'
import type { UseCreateContext as UseQueryCreateContext, UseCreateProps as UseQueryCreateProps } from '../../query'
import { useCreate as useQueryCreate } from '../../query'
import type { RecordMaybeRef } from '../helper/types'
import { pickUnrefs } from '../helper/pick-unrefs'
import type { UseNotifyContext } from '../../notification'
import { useNotify } from '../../notification'
import type { UseGoContext } from '../../router'
import { useGo } from '../../router'

export type UseCreateProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> = Simplify<
	& UseQueryCreateProps<TData, TError, TParams>
	& RecordMaybeRef<Pick<CreateMutationProps<TParams>, typeof PICK_PROPS_FIELDS[number]>>
	& {
		resource: MaybeRef<string>
	}
>

export type UseCreateContext = Simplify<
	& UseQueryCreateContext
	& UseNotifyContext
	& UseGoContext
>

export interface UseCreateResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	isSaving: Ref<boolean>
	save: SaveCreateFn<TData, TError, TParams>
}

export function useCreate<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: UseCreateProps<TData, TError, TParams>,
	context?: UseCreateContext,
) {
	const go = useGo(context)
	const notify = useNotify(context)

	const create = useQueryCreate<TData, TError, TParams>(props, context)
	const save = createSaveCreateFn<TData, TError, TParams>({
		mutate: create,
		notify,
		go,
		getProps: values => ({
			// eslint-disable-next-line ts/no-use-before-define
			...pickUnrefs(props, PICK_PROPS_FIELDS),
			resource: unref(props.resource),
			params: values,
		}),
		getOptions: () => unref(props.mutationOptions),
	})

	// TODO: return resoruce
	// TODO: return redirect
	// TODO: notify when error

	return {
		save,
		isSaving: create.isLoading,
	}
}

const PICK_PROPS_FIELDS = [
	'fetcherName',
	'invalidates',
	'meta',
] as const
