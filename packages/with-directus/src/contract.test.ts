import { authentication, createDirectus, rest } from '@directus/sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createAuth } from './auth'
import { createFetcher } from './fetcher'

/**
 * These assert the HTTP requests that actually leave the client, against a real
 * `createDirectus` instance with only `fetch` replaced.
 *
 * The point is the SDK boundary: the v20 `login(email, password)` → `login(payload)` break was
 * invisible to every mock-the-SDK test in this package, because those assert our own call
 * shape rather than the request it produces. This file would have caught it on the bump.
 *
 * ponytail: no live Directus. It pins our side of the contract, not the server's — a server
 * behaviour change still needs a real instance to catch.
 */

const BASE = 'http://localhost:8055'

function setup(response: unknown = { data: {} }) {
	const sent: Record<string, any>[] = []

	const fetchSpy = vi.fn(async (url: string, init: RequestInit = {}) => {
		const parsed = new URL(url)
		sent.push({
			method: init.method ?? 'GET',
			path: parsed.pathname,
			search: parsed.search,
			body: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
			credentials: init.credentials,
		})
		return {
			ok: true,
			status: 200,
			headers: new Headers({ 'Content-Type': 'application/json' }),
			json: async () => response,
			text: async () => JSON.stringify(response),
		} as any
	})

	const client = createDirectus(BASE, { globals: { fetch: fetchSpy as any } })
		.with(authentication('session', { autoRefresh: false, credentials: 'include' }))
		.with(rest({ credentials: 'include' }))

	return { client, sent }
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('auth over the wire', () => {
	it('should POST credentials as a payload object to /auth/login', async () => {
		const { client, sent } = setup({
			data: { access_token: 'AT', refresh_token: null, expires: 900000 },
		})
		const auth = createAuth({ client })

		await auth.login({
			type: 'password',
			params: { email: 'a@b.c', password: 'pw', options: { otp: '123456' } },
		})

		expect(sent).toHaveLength(1)
		expect(sent[0]).toMatchObject({
			method: 'POST',
			path: '/auth/login',
			// The v20 shape: email, password and options at the top level of the body, not positional args.
			body: { email: 'a@b.c', password: 'pw', otp: '123456', mode: 'session' },
		})
	})

	it('should never POST for an sso login, only navigate', async () => {
		const { client, sent } = setup()
		const auth = createAuth({ client })
		const assign = vi.fn()
		vi.stubGlobal('window', { location: { href: 'https://app.test/x', assign } })

		await auth.login({ type: 'sso', params: { provider: 'google' } })

		expect(sent).toHaveLength(0)
		expect(assign).toHaveBeenCalledWith(
			`${BASE}/auth/login/google?redirect=https%3A%2F%2Fapp.test%2Fx`,
		)
	})

	it('should POST /auth/refresh with credentials when the token store is cold', async () => {
		const { client, sent } = setup({
			data: { access_token: 'AT', refresh_token: null, expires: 900000 },
		})
		const auth = createAuth({ client })

		const result = await auth.check()

		expect(sent).toHaveLength(1)
		expect(sent[0]).toMatchObject({
			method: 'POST',
			path: '/auth/refresh',
			body: { mode: 'session' },
			credentials: 'include',
		})
		expect(result).toEqual({ authenticated: true })
	})

	it('should report unauthenticated when the refresh is rejected, sharing it across concurrent checks', async () => {
		// A cold client with no session cookie: Directus answers 401 with no token.
		const fetchSpy = vi.fn().mockRejectedValue(new Error('401'))
		const client = createDirectus(BASE, { globals: { fetch: fetchSpy as any } })
			.with(authentication('session', { autoRefresh: false, credentials: 'include' }))
			.with(rest({ credentials: 'include' }))
		const auth = createAuth({ client })

		// N mounted guards checking a cold store at once share one in-flight refresh.
		expect(await Promise.all([auth.check(), auth.check()])).toEqual([
			{ authenticated: false },
			{ authenticated: false },
		])
		expect(fetchSpy).toHaveBeenCalledTimes(1)
	})

	it('should GET /users/me for the identity', async () => {
		const { client, sent } = setup({ data: { id: 'u1', email: 'a@b.c' } })
		const auth = createAuth({ client })

		const identity = await auth.getIdentity!()

		expect(sent[0]).toMatchObject({ method: 'GET', path: '/users/me' })
		expect(identity).toEqual({ id: 'u1', email: 'a@b.c' })
	})

	it('should POST /auth/logout', async () => {
		const { client, sent } = setup()
		const auth = createAuth({ client })

		await auth.logout()

		expect(sent[0]).toMatchObject({ method: 'POST', path: '/auth/logout' })
	})
})

describe('fetcher over the wire', () => {
	it('should GET the collection and its aggregate in one round of requests', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.getList({
			resource: 'posts',
			pagination: { current: 2, perPage: 10 },
			sorters: [{ field: 'title', order: 'asc' as any }],
			filters: [{ field: 'category', operator: 'eq', value: 'news' }],
		})

		// Two GETs to the same endpoint: the rows, and the count. The aggregate one is the
		// request carrying an `aggregate` param — that is the only thing telling them apart.
		expect(sent).toHaveLength(2)
		expect(sent.every(s => s.method === 'GET' && s.path === '/items/posts')).toBe(true)

		const queries = sent.map(s => new URLSearchParams(s.search))
		const list = queries.find(q => !q.has('aggregate'))!
		const count = queries.find(q => q.has('aggregate'))!

		expect(list.get('page')).toBe('2')
		expect(list.get('limit')).toBe('10')
		expect(list.get('sort')).toBe('title')
		expect(JSON.parse(list.get('filter')!)).toEqual({
			_and: [{ category: { _eq: 'news' } }],
		})

		expect(JSON.parse(count.get('aggregate')!)).toEqual({ countDistinct: 'id' })
		// The count is over the whole filtered set, so it must not be paged.
		expect(count.has('page')).toBe(false)
		expect(JSON.parse(count.get('filter')!)).toEqual({
			_and: [{ category: { _eq: 'news' } }],
		})
	})

	it('should GET a single item by id', async () => {
		const { client, sent } = setup({ data: { id: 7 } })
		const fetcher = createFetcher({ client })

		await fetcher.getOne({ resource: 'posts', id: 7 })

		expect(sent[0]).toMatchObject({ method: 'GET', path: '/items/posts/7' })
	})

	it('should POST a created item', async () => {
		const { client, sent } = setup({ data: { id: 7 } })
		const fetcher = createFetcher({ client })

		await fetcher.createOne({ resource: 'posts', params: { title: 'hi' } })

		expect(sent[0]).toMatchObject({
			method: 'POST',
			path: '/items/posts',
			body: { title: 'hi' },
		})
	})

	it('should PATCH an updated item', async () => {
		const { client, sent } = setup({ data: { id: 7 } })
		const fetcher = createFetcher({ client })

		await fetcher.updateOne({ resource: 'posts', id: 7, params: { title: 'bye' } })

		expect(sent[0]).toMatchObject({
			method: 'PATCH',
			path: '/items/posts/7',
			body: { title: 'bye' },
		})
	})

	it('should DELETE an item', async () => {
		const { client, sent } = setup({ data: null })
		const fetcher = createFetcher({ client })

		await fetcher.deleteOne({ resource: 'posts', id: 7 })

		expect(sent[0]).toMatchObject({ method: 'DELETE', path: '/items/posts/7' })
	})

	it('should route a directus_ resource to its system endpoint', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.getList({ resource: 'directus_users' })

		expect(sent.map(s => s.path)).toContain('/users')
	})
})
