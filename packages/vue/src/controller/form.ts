import type { BaseRecord } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseCreateContext, UseCreateResult, UseGetOneContext, UseGetOneResult, UseUpdateContext, UseUpdateResult } from '../query'
import type { UseResourceContext } from '../resource'
import type { UseGoContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import { Form } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useCreate, useGetOne, useUpdate } from '../query'
import { useResource } from '../resource'
import { useNavigateTo } from '../router'
import { unrefs } from '../utils/unrefs'

export type UseFormProps<
	TQueryData extends BaseRecord,
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError,
> = ToMaybeRefs<
	Form.Props<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>
>

export type UseFormContext = Simplify<
	& UseResourceContext
	& UseGetOneContext
	& UseCreateContext
	& UseUpdateContext
	& UseGoContext
>

export type UseFormResult<
	TMutationParams,
	TQueryError,
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
	TMutationError = unknown,
> = Simplify<
	& {
		query: UseGetOneResult<TQueryError, TQueryResultData>
		create: UseCreateResult<TMutationData, TMutationError, TMutationParams>
		update: UseUpdateResult<TMutationData, TMutationError, TMutationParams>
		record: Ref<TQueryResultData | undefined>
		isLoading: Ref<boolean>
		save: Form.SaveFn<TMutationParams, TMutationData>
	}
>

export function useForm<
	TQueryData extends BaseRecord = BaseRecord,
	TMutationParams = unknown,
	TQueryError = unknown,
	TQueryResultData extends BaseRecord = TQueryData,
	TMutationData extends BaseRecord = TQueryResultData,
	TMutationError = unknown,
>(
	props?: UseFormProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
	context?: UseFormContext,
): UseFormResult<TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError> {
	const resource = useResource({ name: props?.resource }, context)
	const navigateTo = useNavigateTo()

	const resolvedProps = computed(() => Form.resolveProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		props: unrefs(props),
		resource: unref(resource),
	}))
	const isEnabledQuery = computed(() => {
		const _props = unref(resolvedProps)
		const opts = 'queryOptions' in _props ? _props.queryOptions : undefined

		return Form.getIsEnabledQuery({
			action: _props.action,
			enabled: opts?.enabled,
		})
	})

	const queryResult = useGetOne<TQueryData, TQueryError, TQueryResultData>({
		resource: computed(() => unref(resolvedProps).resource),
		id: computed(() => {
			const _props = unref(resolvedProps)
			if ('id' in _props)
				return _props.id
		}),
		queryOptions: computed(() => {
			const _props = unref(resolvedProps)
			const opts = 'queryOptions' in _props ? _props.queryOptions : undefined

			return {
				...opts,
				enabled: unref(isEnabledQuery),
			}
		}),
		fetcherName: computed(() => unref(resolvedProps).fetcherName),
		meta: computed(() => {
			const _props = unref(resolvedProps)
			if ('queryMeta' in _props)
				return _props.queryMeta
		}),
	}, context)

	const mutationCreateResult = useCreate<TMutationData, TMutationParams, TMutationError>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		mutationOptions: props?.mutationOptions,
	}, context)

	const mutationUpdateResult = useUpdate<TMutationData, TMutationParams, TMutationError>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		mutationOptions: props?.mutationOptions,
	}, context)

	const isLoading = computed(() => Form.getIsPending({
		action: unref(resolvedProps).action,
		isQueryFetching: unref(queryResult.isFetching),
		isCreatePending: unref(mutationCreateResult.isPending),
		isUpdatePending: unref(mutationUpdateResult.isPending),
	}))

	const save = Form.createSaveFn<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>({
		navigateTo,
		getProps: () => unref(resolvedProps),
		mutateFnForCreate: mutationCreateResult.mutateAsync,
		mutateFnForUpdate: mutationUpdateResult.mutateAsync,
	})

	const record = computed(() => Form.getRecord<TQueryResultData>({
		resolvedProps: unref(resolvedProps),
		queryResultData: unref(queryResult.data),
	}))

	return {
		query: queryResult,
		create: mutationCreateResult,
		update: mutationUpdateResult,
		record,
		isLoading,
		save,
	}
}
