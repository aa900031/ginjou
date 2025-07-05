import type { AuthLogoutResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseQueryClientContextProps } from '../query/query-client'
import type { UseGoContext } from '../router'
import type { UseAuthContextFromProps } from './auth'
import { Logout } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query/query-client'
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
> =
	& UseMutationReturnType<
		AuthLogoutResult,
		TError,
		TParams,
		unknown
	>
	& {
		mutate: Logout.MutateFn<TParams, TError>
		mutateAsync: Logout.MutateAsyncFn<TParams, TError>
	}

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

	const mutation = useMutation<AuthLogoutResult, TError, TParams>({
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
	}, queryClient)

	const mutate = Logout.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = Logout.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}
}
