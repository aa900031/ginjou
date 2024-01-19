import { computed, unref } from 'vue-demi'
import { type BaseRecord, Form } from '@ginjou/core'
import { useCreate, useGetOne, useUpdate } from '../query'
import { useResource } from '../resource'
import type { ToMaybeRefs } from '../utils/refs'
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

export function useForm<
	TQueryData extends BaseRecord = BaseRecord,
	TMutationParams = unknown,
	TQueryError = unknown,
	TQueryResultData extends BaseRecord = TQueryData,
	TMutationData extends BaseRecord = TQueryResultData,
	TMutationError = unknown,
>(
	props?: UseFormProps<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>,
) {
	const resource = useResource({ name: props?.resource })
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
		fetcherName: props?.fetcherName,
		meta: computed(() => {
			const _props = unref(resolvedProps)
			if ('queryMeta' in _props)
				return _props.queryMeta
		}),
	})

	const mutationCreateResult = useCreate<TMutationData, TMutationError, TMutationParams>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		mutationOptions: props.mutationOptions,
	})

	const mutationUpdateResult = useUpdate<TMutationData, TMutationError, TMutationParams>({
		// eslint-disable-next-line ts/ban-ts-comment
		// @ts-expect-error
		mutationOptions: props.mutationOptions,
	})

	const isLoading = computed(() => Form.getIsLoading({
		action: unref(resolvedProps).action,
		isQueryFetching: unref(queryResult.isFetching),
		isCreateLoading: unref(mutationCreateResult.isLoading),
		isUpdateLoading: unref(mutationUpdateResult.isLoading),
	}))

	const save = Form.createSaveFn<TQueryData, TMutationParams, TQueryError, TQueryResultData, TMutationData, TMutationError>({
		getProps: () => unref(resolvedProps),
		mutateFnForCreate: mutationCreateResult.mutateAsync,
		mutateFnForUpdate: mutationUpdateResult.mutateAsync,
	})

	// TODO: return record
	return {
		isLoading,
		save,
	}
}
