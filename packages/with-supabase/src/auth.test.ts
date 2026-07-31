import { describe, expect, it, vi } from 'vitest'
import { createAuth } from './auth'

describe('createAuth', () => {
	it('dispatches password login to Supabase', async () => {
		const signInWithPassword = vi.fn().mockResolvedValue({ error: null })
		const auth = createAuth({
			client: {
				auth: { signInWithPassword },
			} as any,
		})
		const params = {
			email: 'test@example.com',
			password: 'password',
		}

		await auth.login({ type: 'password', params })

		expect(signInWithPassword).toHaveBeenCalledWith(params)
	})
})
