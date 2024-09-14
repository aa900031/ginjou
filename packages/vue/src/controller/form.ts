import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { BaseRecord } from '@ginjou/core'
import { Form } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseCreateContext, UseGetOneContext, UseUpdateContext } from '../query'
import { useCreate, useGetOne, useUpdate } from '../query'
import type { UseResourceContext } from '../resource'
import { useResource, useResourceContext } from '../resource'
import type { ToMaybeRefs } from '../utils/refs'
import { unrefs } from '../utils/unrefs'
import type { UseGoContext } from '../router'
import { useGo } from '../router'

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
	TQueryResultData extends BaseRecord,
	TMutationData extends BaseRecord,
> = Simplify<
	& {
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
): UseFormResult<TMutationParams, TQueryResultData, TMutationData> {
	const resourceContext = useResourceContext(context)
	const resource = useResource({ name: props?.resource }, context)
	const go = useGo(context)

	const resolvedProps = computed(() => Form.resolveProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		props: unrefs(props),
		resource: unref(resource),
	}))
	const isEnabledQuery = computed(() => Form.getIsEnabledQuery({
		action: unref(resolvedProps).action,
	}))

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
				enabled: unref(isEnabledQuery),
				...opts,
			}
		}),
		fetcherName: computed(() => unref(resolvedProps).fetcherName),
		meta: computed(() => {
			const _props = unref(resolvedProps)
			if ('queryMeta' in _props)
				return _props.queryMeta
		}),
	}, context)

	const mutationCreateResult = useCreate<TMutationData, TMutationError, TMutationParams>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		mutationOptions: props?.mutationOptions,
	}, context)

	const mutationUpdateResult = useUpdate<TMutationData, TMutationError, TMutationParams>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		mutationOptions: props?.mutationOptions,
	}, context)

	const isLoading = computed(() => Form.getIsLoading({
		action: unref(resolvedProps).action,
		isQueryFetching: unref(queryResult.isFetching),
		isCreateLoading: unref(mutationCreateResult.isLoading),
		isUpdateLoading: unref(mutationUpdateResult.isLoading),
	}))

	const save = Form.createSaveFn<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>({
		go,
		getResourceContext: () => unref(resourceContext!),
		getProps: () => unref(resolvedProps),
		mutateFnForCreate: mutationCreateResult.mutateAsync,
		mutateFnForUpdate: mutationUpdateResult.mutateAsync,
	})

	const record = computed(() => Form.getRecord<TQueryResultData>({
		resolvedProps: unref(resolvedProps),
		queryResultData: unref(queryResult.data),
	}))

	return {
		record,
		isLoading,
		save,
	}
}
