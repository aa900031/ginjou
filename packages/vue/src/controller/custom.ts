import { type BaseRecord, createCustomControllerErrorHandler, createCustomControllerSuccessHandler } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { UseCustomContext, UseCustomProps, UseCustomResult } from '../query'
import { useCustom } from '../query'
import type { UseNotificationContextFromProps } from '../notification'
import { useNotificationContext } from '../notification'
import { type UseI18nContextFromProps, useI18nContext } from '../i18n'
import { useCheckError } from '../auth'
import type { UseCheckErrorContext } from '../auth'

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
	& UseI18nContextFromProps
	& UseNotificationContextFromProps
	& UseCheckErrorContext
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
	const i18n = useI18nContext(context)
	const notification = useNotificationContext(context)
	const { mutateAsync: checkError } = useCheckError(context)

	function getProps() {
		return {
			url: unref(props.url),
			method: unref(props.method),
			sorters: unref(props.sorters),
			filters: unref(props.filters),
			payload: unref(props.payload),
			query: unref(props.query),
			headers: unref(props.headers),
			meta: unref(props.meta),
			fetcherName: unref(props.fetcherName),
		}
	}

	const handleSuccess = createCustomControllerSuccessHandler({
		notification,
		i18n,
		getProps,
		onSuccess: (...args) => (
			// eslint-disable-next-line ts/ban-ts-comment
			// @ts-expect-error
			unref(props.queryOptions)?.onSuccess?.(...args)
		),
	})

	const handleError = createCustomControllerErrorHandler({
		notification,
		i18n,
		getProps,
		checkError,
		onError: (...args) => (
			// eslint-disable-next-line ts/ban-ts-comment
			// @ts-expect-error
			unref(props.queryOptions)?.onError?.(...args)
		),
	})

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
