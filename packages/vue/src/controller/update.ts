import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import { createUpdateControllerErrorHandler, createUpdateControllerSuccessHandler } from '@ginjou/core'
import type { BaseRecord } from '@ginjou/core'
import { type UseUpdateContext, type UseUpdateProps, type UseUpdateResult, useUpdate } from '../query'
import type { UseI18nContextFromProps } from '../i18n'
import { useI18nContext } from '../i18n'
import type { UseNotificationContextFromProps } from '../notification'
import { useNotificationContext } from '../notification'
import type { UseCheckErrorContext } from '../auth'
import { useCheckError } from '../auth'

export type UseUpdateControllerProps<
	TData extends BaseRecord,
	TError,
	TParams extends Record<string, any>,
> = Simplify<
	& UseUpdateProps<TData, TError, TParams>
>

export type UseUpdateControllerContext = Simplify<
	& UseI18nContextFromProps
	& UseNotificationContextFromProps
	& UseCheckErrorContext
	& UseUpdateContext
>

export function useUpdateController<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = Record<string, any>,
>(
	props?: UseUpdateControllerProps<TData, TError, TParams>,
	context?: UseUpdateControllerContext,
): UseUpdateResult<TData, TError, TParams> {
	const i18n = useI18nContext(context)
	const notification = useNotificationContext(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const handleSuccess = createUpdateControllerSuccessHandler<TData, TError, TParams>({
		i18n,
		notification,
	})
	const handleError = createUpdateControllerErrorHandler<TData, TError, TParams>({
		i18n,
		notification,
		checkError,
	})

	return useUpdate<TData, TError, TParams>({
		mutationOptions: computed(() => ({
			onSuccess: handleSuccess,
			onError: handleError,
			...unref(props?.mutationOptions),
		})),
	}, context)
}
