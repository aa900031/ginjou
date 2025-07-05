import type { AuthLoginResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseQueryClientContextProps } from '../query/query-client'
import type { UseGoContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import { Login } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query/query-client'
import { useGo } from '../router'
import { useAuthContext } from './auth'

export type UseLoginProps<
	TParams,
	TError,
> = ToMaybeRefs<
	& Login.Props<TParams, TError>
>

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
> = OverrideProperties<
	UseMutationReturnType<
		AuthLoginResult,
		TError,
		TParams,
		unknown
	>,
	{
		mutate: Login.MutateFn<TParams, TError>
		mutateAsync: Login.MutateAsyncFn<TParams, TError>
	}
>

export function useLogin<
	TParams = unknown,
	TError = unknown,
>(
	props?: UseLoginProps<TParams, TError>,
	context?: UseLoginContext,
): UseLoginResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const notify = useNotify(context)
	const translate = useTranslate(context)

	const mutation = useMutation<AuthLoginResult, TError, TParams>(computed(() => ({
		mutationKey: Login.createMutationKey(),
		mutationFn: Login.createMutationFn({
			auth,
		}),
		onSuccess: Login.createSuccessHandler({
			queryClient,
			go,
		}),
		onError: Login.createErrorHandler({
			notify,
			translate,
		}),
		...unref(props?.mutationOptions),
	})), queryClient)

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
