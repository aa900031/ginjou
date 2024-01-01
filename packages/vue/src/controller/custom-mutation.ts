import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { BaseRecord } from '@ginjou/core'
import { createCustomMutationControllerErrorHandler, createCustomMutationControllerSuccessHandler } from '@ginjou/core'
import type { UseTranslateContext } from '../i18n'
import { useTranslate } from '../i18n'
import type { UseNotifyContext } from '../notification'
import { useNotify } from '../notification'
import type { UseCheckErrorContext } from '../auth'
import { useCheckError } from '../auth'
import { useCustomMutation } from '../query'
import type { UseCustomMutationContext, UseCustomMutationProps, UseCustomMutationResult } from '../query'

export type UseCustomMutationControllerProps<
	TData extends BaseRecord,
	TQuery,
	TPayload,
	TError,
> = Simplify<
	& UseCustomMutationProps<TData, TError, TQuery, TPayload>
>

export type UseCustomMutationControllerContext = Simplify<
	& UseTranslateContext
	& UseNotifyContext
	& UseCheckErrorContext
	& UseCustomMutationContext
>

export type UseCustomMutationControllerResult<
	TData extends BaseRecord,
	TQuery,
	TPayload,
	TError,
> = Simplify<
	& UseCustomMutationResult<TData, TError, TQuery, TPayload>
>

export function useCustomMutationController<
	TData extends BaseRecord = BaseRecord,
	TQuery = unknown,
	TPayload = unknown,
	TError = unknown,
>(
	props: UseCustomMutationControllerProps<TData, TQuery, TPayload, TError>,
	context?: UseCustomMutationControllerContext,
): UseCustomMutationControllerResult<TData, TQuery, TPayload, TError> {
	const translate = useTranslate(context)
	const notify = useNotify(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const handleSuccess = createCustomMutationControllerSuccessHandler({
		notify,
		translate,
	})
	const handleError = createCustomMutationControllerErrorHandler({
		notify,
		translate,
		checkError,
	})

	const mutation = useCustomMutation<TData, TError, TQuery, TPayload>({
		mutationOptions: computed(() => ({
			onSuccess: handleSuccess,
			onError: handleError,
			...unref(props?.mutationOptions),
		})),
	})

	return {
		...mutation,
	}
}
