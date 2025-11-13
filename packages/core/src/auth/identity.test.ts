import { describe, expect, it, vi } from 'vitest'
import { createQueryContext } from '../../test/tanstack-utils'
import { createQueryFn, createQueryKey } from './identity'

describe('createQueryKey', () => {
	it('should return the correct query key with params', () => {
		const params = { id: 1 }
		expect(createQueryKey(params)).toEqual(['auth', 'identity', params])
	})

	it('should return the correct query key without params', () => {
		expect(createQueryKey()).toEqual(['auth', 'identity'])
	})
})

describe('createQueryFn', () => {
	it('should throw an error if auth.getIdentity is not a function', async () => {
		const getParams = () => ({})
		const queryFn = createQueryFn({ auth: undefined, getParams })
		await expect(queryFn(createQueryContext())).rejects.toThrow('No')

		const queryFn2 = createQueryFn({ auth: {} as any, getParams })
		await expect(queryFn2(createQueryContext())).rejects.toThrow('No')
	})

	it('should call auth.getIdentity with params and return the result', async () => {
		const mockIdentityResult = { id: 'user123' }
		const mockGetIdentity = vi.fn(() => Promise.resolve(mockIdentityResult))
		const auth = { getIdentity: mockGetIdentity } as any
		const params = { someParam: 'value' }
		const getParams = () => params

		const queryFn = createQueryFn({ auth, getParams })
		const result = await queryFn(createQueryContext())

		expect(mockGetIdentity).toHaveBeenCalledWith(params)
		expect(result).toEqual(mockIdentityResult)
	})
})
