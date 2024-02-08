import type { Simplify } from 'type-fest'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import type { AuthLoginResult } from '@ginjou/core'
import { Login } from '@ginjou/core'
import type { UseNotifyContext } from '../notification'
import { useNotify } from '../notification'
import type { UseTranslateContext } from '../i18n'
import { useTranslate } from '../i18n'
import type { UseGoContext } from '../router'
import { useGo } from '../router'
import { useQueryClientContext } from '../query/query-client'
import type { UseQueryClientContextProps } from '../query/query-client'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export type UseLoginContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
	& UseGoContext
	& UseNotifyContext
	& UseTranslateContext
>

export type UseLoginResult<
	TParams,
	TError,
> = UseMutationReturnType<
	AuthLoginResult,
	TError,
	TParams,
	unknown
>

export function useLogin<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseLoginContext,
): UseLoginResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const notify = useNotify(context)
	const translate = useTranslate(context)

	return useMutation<AuthLoginResult, TError, TParams>({
		mutationKey: Login.createMutationKey(),
		mutationFn: Login.createMutationFn<TParams>({
			auth,
		}),
		onSuccess: Login.createSuccessHandler<TParams>({
			queryClient,
			go,
		}),
		onError: Login.createErrorHandler<TParams, TError>({
			notify,
			translate,
		}),
		queryClient,
	})
}
