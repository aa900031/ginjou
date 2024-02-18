import type { Simplify } from 'type-fest'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import type { AuthLogoutResult } from '@ginjou/core'
import { Logout } from '@ginjou/core'
import type { UseQueryClientContextProps } from '../query/query-client'
import { useQueryClientContext } from '../query/query-client'
import type { UseNotifyContext } from '../notification'
import { useNotify } from '../notification'
import type { UseTranslateContext } from '../i18n'
import { useTranslate } from '../i18n'
import type { UseGoContext } from '../router'
import { useGo } from '../router'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export type UseLogoutContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
	& UseGoContext
	& UseNotifyContext
	& UseTranslateContext
>

export type UseLogoutResult<
	TParams,
	TError,
> = UseMutationReturnType<
	AuthLogoutResult,
	TError,
	TParams,
	unknown
>

export function useLogout<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseLogoutContext,
): UseLogoutResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const notify = useNotify(context)
	const translate = useTranslate(context)

	return useMutation<AuthLogoutResult, TError, TParams>({
		mutationKey: Logout.createMutationKey(),
		mutationFn: Logout.createMutationFn<TParams>({
			auth,
		}),
		onSuccess: Logout.createSuccessHandler<TParams>({
			queryClient,
			go,
		}),
		onError: Logout.createErrorHandler<TParams, TError>({
			notify,
			translate,
		}),
		queryClient,
	})
}
