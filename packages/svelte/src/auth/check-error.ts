import type { AuthCheckErrorResult } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { UseAuthContextFromProps } from './auth'
import type { UseLogoutContext } from './logout'
import { CheckError } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useQueryClientContext } from '../query'
import { useGo } from '../router'
import { createExecableFn } from '../utils/store'
import { useAuthContext } from './auth'
import { useLogout } from './logout'

export type UseCheckErrorContext = Simplify<
	& UseAuthContextFromProps
	& UseLogoutContext
	& UseGoContext
	& UseQueryClientContextProps
>

export type UseCheckErrorResult<
	TParams,
	TError,
> = CreateMutationResult<
	AuthCheckErrorResult,
	TError,
	TParams,
	unknown
>

export function useCheckError<
	TParams = unknown,
	TError = unknown,
>(
	context?: UseCheckErrorContext,
): UseCheckErrorResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const logout = useLogout(context)

	return createMutation(
		{
			mutationKey: CheckError.createMutationKey(),
			mutationFn: CheckError.createMutationFn<TParams, TError>({
				auth,
			}),
			onSuccess: CheckError.createSuccessHandler<TParams, TError>({
				logout: createExecableFn(logout, 'mutateAsync'),
				go,
			}),
		},
		queryClient,
	)
}
