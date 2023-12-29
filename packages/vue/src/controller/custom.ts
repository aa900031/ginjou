import { type BaseRecord, createCustomControllerErrorHandler, createCustomControllerSuccessHandler } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { UseCustomContext, UseCustomProps, UseCustomResult } from '../query'
import { useCustom } from '../query'
import { useCheckError, useI18nContext } from '..'
import { useNotificationContext } from '../notification'

export type UseCustomControllerProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
	TResultData extends BaseRecord,
> = Simplify<
	& UseCustomProps<TData, TError, TQuery, TPayload, TResultData>
>

export type UseCustomControllerContext = Simplify<
	& UseCustomContext
>

export type UseCustomControllerResult<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& UseCustomResult<TData, TError, TResultData>
>

export function useCustomController<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseCustomControllerProps<TData, TError, TQuery, TPayload, TResultData>,
	context?: UseCustomControllerContext,
): UseCustomControllerResult<TData, TError, TResultData> {
	const i18n = useI18nContext()
	const notification = useNotificationContext()
	const checkError = useCheckError()

	const handleSuccess = createCustomControllerSuccessHandler()
	const handleError = createCustomControllerErrorHandler()

	const custom = useCustom<TData, TError, TQuery, TPayload, TResultData>({
		...props,
		queryOptions: computed(() => ({
			...unref(props.queryOptions),
			onSuccess: handleSuccess,
			onError: handleError,
		})),
	}, context)

	return {
		...custom,
	}
}
