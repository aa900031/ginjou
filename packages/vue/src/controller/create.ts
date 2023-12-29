import { computed, unref } from 'vue-demi'
import type { Simplify } from 'type-fest'
import { createCreateControllerErrorHandler, createCreateControllerSuccessHandler } from '@ginjou/core'
import type { BaseRecord } from '@ginjou/core'
import { useCreate } from '../query'
import type { UseCreateContext, UseCreateProps, UseCreateResult } from '../query'
import type { UseNotificationContextFromProps } from '../notification'
import { useNotificationContext } from '../notification'
import type { UseI18nContextFromProps } from '../i18n'
import { useI18nContext } from '../i18n'
import type { UseCheckErrorContext } from '../auth'
import { useCheckError } from '../auth'

export type UseCreateControllerProps<
	TData extends BaseRecord,
	TError,
	TParams extends Record<string, any>,
> = Simplify<
	& UseCreateProps<TData, TError, TParams>
>

export type UseCreateControllerContext = Simplify<
	& UseI18nContextFromProps
	& UseNotificationContextFromProps
	& UseCheckErrorContext
	& UseCreateContext
>

export type UseCreateControllerResult<
	TData extends BaseRecord,
	TError,
	TParams extends Record<string, any>,
> = Simplify<
	& UseCreateResult<TData, TError, TParams>
>

export function useCreateController<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props?: UseCreateControllerProps<TData, TError, TParams>,
	context?: UseCreateControllerContext,
): UseCreateControllerResult<TData, TError, TParams> {
	const i18n = useI18nContext(context)
	const notification = useNotificationContext(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const handleSuccess = createCreateControllerSuccessHandler<TData, TError, TParams>({
		i18n,
		notification,
	})
	const handleError = createCreateControllerErrorHandler<TData, TError, TParams>({
		i18n,
		notification,
		checkError,
	})

	const create = useCreate<TData, TError, TParams>(
		{
			mutationOptions: computed(() => ({
				onSuccess: handleSuccess,
				onError: handleError,
				...unref(props?.mutationOptions),
			})),
		},
		context,
	)

	// TODO: realtime

	return {
		...create,
	}
}
