import type { Simplify } from 'type-fest'
import { type BaseRecord, createDeleteControllerErrorHandler, createDeleteControllerSuccessHandler } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { type UseDeleteContext, type UseDeleteProps, type UseDeleteResult, useDelete } from '../../query'
import { type UseI18nContextFromProps, useI18nContext } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'
import { type UseNotificationContextFromProps, useNotificationContext } from '../notification'

export type UseDeleteControllerProps<
	TData extends BaseRecord,
	TError,
	TParams extends Record<string, any>,
> = Simplify<
	& UseDeleteProps<TData, TError, TParams>
>

export type UseDeleteControllerContext = Simplify<
	& UseI18nContextFromProps
	& UseNotificationContextFromProps
	& UseCheckErrorContext
	& UseDeleteContext
>

export type UseDeleteControllerResult<
	TData extends BaseRecord,
	TError,
	TParams extends Record<string, any>,
> = Simplify<
	& UseDeleteResult<TData, TError, TParams>
>

export function useDeleteController<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props?: UseDeleteControllerProps<TData, TError, TParams>,
	context?: UseDeleteControllerContext,
): UseDeleteControllerResult<TData, TError, TParams> {
	const i18n = useI18nContext(context)
	const notification = useNotificationContext(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const handleSuccess = createDeleteControllerSuccessHandler<TData, TError, TParams>({
		notification,
		i18n,
	})

	const handleError = createDeleteControllerErrorHandler<TData, TError, TParams>({
		notification,
		i18n,
		checkError,
	})

	const deleteOne = useDelete<TData, TError, TParams>({
		mutationOptions: computed(() => ({
			onSuccess: handleSuccess,
			onError: handleError,
			...unref(props?.mutationOptions),
		})),
	}, context)

	return {
		...deleteOne,
	}
}
