import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { type BaseRecord, createShowErrorHandler, getShowRecord } from '@ginjou/core'
import type { MaybeRef } from '@vueuse/shared'
import { useGetOne } from '../query'
import type { UseGetOneContext, UseGetOneProps, UseGetOneResult } from '../query'
import { type UseI18nContextFromProps, useI18nContext } from '../i18n'
import { type UseNotificationContextFromProps, useNotificationContext } from '../notification'
import { type UseCheckErrorContext, useCheckError } from '../auth'

export type UseShowControllerProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& UseGetOneProps<TData, TError, TResultData>
	& {
		resource: MaybeRef<string>
	}
>

export type UseShowControllerContext = Simplify<
	& UseI18nContextFromProps
	& UseNotificationContextFromProps
	& UseCheckErrorContext
	& UseGetOneContext
>

export type UseShowControllerResult<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& UseGetOneResult<TData, TError, TResultData>
	& {
		record: Ref<TResultData | undefined>
	}
>

export function useShowController<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseShowControllerProps<TData, TError, TResultData>,
	context?: UseShowControllerContext,
): UseShowControllerResult<TData, TError, TResultData> {
	const i18n = useI18nContext(context)
	const notification = useNotificationContext(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const handleError = createShowErrorHandler({
		notification,
		i18n,
		checkError,
		getProps: () => ({
			id: unref(props.id)!,
			resource: unref(props.resource)!,
			meta: unref(props.meta),
		}),
	})

	const one = useGetOne<TData, TError, TResultData>({
		...props,
		queryOptions: computed(() => ({
			retry: false,
			...unref(props.queryOptions),
			onError: handleError,
		})),
	}, context)

	const record = computed(() => getShowRecord({
		result: unref(one.data),
	}))

	// TODO: realtime

	return {
		...one,
		record,
	}
}
