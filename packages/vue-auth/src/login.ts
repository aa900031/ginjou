import type { Simplify } from 'type-fest'
import type { QueryClient } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AuthLoginResult } from '@ginjou/auth'
import { createLoginMutationFn, createLoginSuccessHandler, genLoginMutationKey } from '@ginjou/auth'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export type UseLoginContext = Simplify<
	& UseAuthContextFromProps
	& {
		queryClient?: QueryClient
	}
>

export function useLogin<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseLoginContext,
) {
	const auth = useAuthContext({ ...context, strict: true })
	const queryClient = context?.queryClient ?? useQueryClient()

	// TODO: success: redirect
	// TODO: success: notify

	return useMutation<AuthLoginResult, TError, TParams>({
		mutationKey: genLoginMutationKey(),
		mutationFn: createLoginMutationFn<TParams>({
			auth,
		}),
		onSuccess: createLoginSuccessHandler<TParams>({
			queryClient,
		}),
	})
}
