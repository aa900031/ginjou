import type { Simplify } from 'type-fest'
import type { QueryClient } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { AuthLogoutResult } from '@ginjou/core'
import { createLogoutMutationFn, createLogoutSuccessHandler, genLogoutMutationKey } from '@ginjou/core'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export type UseLogoutContext = Simplify<
	& UseAuthContextFromProps
	& {
		queryClient?: QueryClient
	}
>

export function useLogout<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseLogoutContext,
) {
	const auth = useAuthContext({ ...context, strict: true })
	const queryClient = context?.queryClient ?? useQueryClient()

	// TODO: success: redirect
	// TODO: success: notify

	return useMutation<AuthLogoutResult, TError, TParams>({
		mutationKey: genLogoutMutationKey(),
		mutationFn: createLogoutMutationFn<TParams>({
			auth,
		}),
		onSuccess: createLogoutSuccessHandler<TParams>({
			queryClient,
		}),
	},
	)
}
