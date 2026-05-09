import type { CheckAuthErrorResult } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseAuthContextFromProps } from './auth'
import type { UseLogoutContext } from './logout.svelte'
import { CheckError } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useQueryClientContext } from '../query'
import { useGo } from '../router'
import { extract } from '../utils'
import { useAuthContext } from './auth'
import { useLogout } from './logout.svelte'

export type UseCheckErrorProps<
	TParams,
	TError,
> = MaybeAccessor<
	CheckError.Props<TParams, TError> | undefined
>

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
	CheckAuthErrorResult<TParams>,
	TError,
	TParams,
	unknown
>

export function useCheckError<
	TParams = unknown,
	TError = unknown,
>(
	props?: UseCheckErrorProps<TParams, TError>,
	context?: UseCheckErrorContext,
): UseCheckErrorResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const { mutateAsync: logout } = useLogout(undefined, context)

	const resolvedProps = $derived(extract(props))
	const mutationKey = CheckError.createMutationKey()
	const mutationFn = CheckError.createMutationFn<TParams>({
		auth,
	})
	const handleSuccess = CheckError.createSuccessHandler<TParams, TError>({
		logout,
		go,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
	})

	return createMutation<CheckAuthErrorResult<TParams>, TError, TParams>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationKey,
			mutationFn,
			onSuccess: handleSuccess,
		}),
		() => queryClient,
	)
}
