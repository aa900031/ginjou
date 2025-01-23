import type { BaseRecord, CreateResult } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth/check-error'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { MaybeReadable } from '../utils/store'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { Create } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { derived } from 'svelte/store'
import { useCheckError } from '../auth/check-error'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { createExecableFn, toReadable } from '../utils/store'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export interface UseCreateProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeReadable<
		| Create.MutationOptionsFromProps<TData, TError, TParams>
		| undefined
	>
}

export type UseCreateContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
>

export type UseCreateResult<
	TData extends BaseRecord,
	TError,
	TParams,
> = CreateMutationResult<
	CreateResult<TData>,
	TError,
	Create.MutationProps<TData, TError, TParams>,
	any
>

export function useCreate<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseCreateProps<TData, TError, TParams>,
	context?: UseCreateContext,
) {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const checkError = useCheckError(context)

	const mutation = createMutation(
		derived([
			toReadable(props?.mutationOptions),
		] as const, ([
			mutationOptions,
		]) => ({
			...mutationOptions,
			mutationFn: Create.createMutationFn<TData, TParams>({
				fetchers,
			}),
			onSuccess: Create.createSuccessHandler<TData, TParams>({
				notify,
				translate,
				publish,
				queryClient,
			}),
			onError: Create.createErrorHandler<TError>({
				notify,
				translate,
				checkError: createExecableFn(checkError, 'mutateAsync'),
			}),
		})),
		queryClient,
	)

	return mutation
}
