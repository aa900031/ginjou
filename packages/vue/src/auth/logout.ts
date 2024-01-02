import type { Simplify } from 'type-fest'
import { useMutation } from '@tanstack/vue-query'
import type { AuthLogoutResult } from '@ginjou/core'
import { createLogoutMutationFn, createLogoutSuccessHandler, genLogoutMutationKey } from '@ginjou/core'
import { type UseQueryClientContextProps, useQueryClientContext } from '../query/query-client'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export type UseLogoutContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
>

export function useLogout<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseLogoutContext,
) {
	const auth = useAuthContext({ ...context, strict: true })
	const queryClient = useQueryClientContext(context)

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
