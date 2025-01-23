import type { AuthLogoutResult } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { UseAuthContextFromProps } from './auth'
import { Logout } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query'
import { useGo } from '../router'
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
> = CreateMutationResult<
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

	return createMutation(
		{
			mutationKey: Logout.createMutationKey(),
			mutationFn: Logout.createMutationFn<TParams>({
				auth,
			}),
			onSuccess: Logout.createSuccessHandler<TParams>({
				go,
				queryClient,
			}),
			onError: Logout.createErrorHandler<TParams, TError>({
				notify,
				translate,
			}),
		},
		queryClient,
	)
}
