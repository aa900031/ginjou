import type { AuthLoginResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseQueryClientContextProps } from '../query/query-client'
import type { UseGoContext } from '../router'
import type { UseAuthContextFromProps } from './auth'
import { Login } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query/query-client'
import { useGo } from '../router'
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
> =
	& UseMutationReturnType<
		AuthLoginResult,
		TError,
		TParams,
		unknown
	>
	& {
		mutate: Login.MutateFn<TParams, TError>
		mutateAsync: Login.MutateAsyncFn<TParams, TError>
	}

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

	const mutation = useMutation<AuthLoginResult, TError, TParams>({
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
	}, queryClient)

	const mutate = Login.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = Login.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}
}
