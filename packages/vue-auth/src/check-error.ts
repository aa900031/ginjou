import type { Simplify } from 'type-fest'
import { useMutation } from '@tanstack/vue-query'
import type { AuthCheckErrorResult } from '@ginjou/auth'
import { createCheckErrorMutatoinFn, createCheckErrorSuccessHandler, genCheckErrorMutationKey } from '@ginjou/auth'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'
import type { UseLogoutContext } from './logout'
import { useLogout } from './logout'

export type UseCheckErrorContext = Simplify<
	& UseAuthContextFromProps
	& UseLogoutContext
>

export function useCheckError<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseCheckErrorContext,
) {
	const auth = useAuthContext({
		auth: context?.auth,
		strict: true,
	})

	const { mutateAsync: logout } = useLogout(context)

	return useMutation<AuthCheckErrorResult, TError, TParams>({
		mutationKey: genCheckErrorMutationKey(),
		mutationFn: createCheckErrorMutatoinFn<TParams>({
			auth,
		}),
		onSuccess: createCheckErrorSuccessHandler<TParams>({
			logout,
		}),
	})
}
