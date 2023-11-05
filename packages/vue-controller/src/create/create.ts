import type { Ref } from 'vue-demi'
import { unref } from 'vue-demi'
import type { Simplify } from 'type-fest'
import type { MaybeRef } from '@vueuse/shared'
import type { BaseRecord, CreateMutationProps } from '@ginjou/query'
import type { UseCreateProps as UseQueryCreateProps } from '@ginjou/vue-query'
import { useCreate as useQueryCreate } from '@ginjou/vue-query'
import type { SaveCreateFn } from '@ginjou/controller'
import { createSaveCreateFn } from '@ginjou/controller'
import type { RecordMaybeRef } from '../helper/types'
import { pickUnrefs } from '../helper/pick-unrefs'

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
) {
	const create = useQueryCreate<TData, TError, TParams>()
	const save = createSaveCreateFn<TData, TError, TParams>({
		mutate: create,
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
