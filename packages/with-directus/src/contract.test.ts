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

	it('should GET many items as one id filter, not one request per id', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.getMany({ resource: 'posts', ids: [7, 8] })

		expect(sent).toHaveLength(1)
		expect(sent[0]).toMatchObject({ method: 'GET', path: '/items/posts' })
		expect(decodeURIComponent(sent[0]!.search)).toContain('"_in":[7,8]')
	})

	it('should POST an array body for many created items', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.createMany({ resource: 'posts', params: [{ title: 'a' }, { title: 'b' }] })

		expect(sent).toHaveLength(1)
		expect(sent[0]).toMatchObject({
			method: 'POST',
			path: '/items/posts',
			body: [{ title: 'a' }, { title: 'b' }],
		})
	})

	it('should PATCH keys and data together for many updated items', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.updateMany({ resource: 'posts', ids: [7, 8], params: { title: 'bye' } })

		expect(sent).toHaveLength(1)
		expect(sent[0]).toMatchObject({
			method: 'PATCH',
			path: '/items/posts',
			body: { keys: [7, 8], data: { title: 'bye' } },
		})
	})

	it('should DELETE many items in one request and echo the keys back', async () => {
		// Directus answers a delete with no content; core still maps over `data`.
		const { client, sent } = setup({ data: null })
		const fetcher = createFetcher({ client })

		const result = await fetcher.deleteMany({ resource: 'posts', ids: [7, 8] })

		expect(sent).toHaveLength(1)
		expect(sent[0]).toMatchObject({ method: 'DELETE', path: '/items/posts', body: { keys: [7, 8] } })
		expect(result).toEqual({ data: [{ id: 7 }, { id: 8 }] })
	})

	it('should route many-methods on a directus_ resource to the plural system endpoint', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.createMany({ resource: 'directus_users', params: [{ email: 'a@b.c' }] })

		expect(sent[0]).toMatchObject({ method: 'POST', path: '/users' })
	})

	it('should send caller conditions that an empty-value scrub would destroy', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.getList({
			resource: 'posts',
			filters: [{ field: 'status', operator: 'eq', value: 'published' }],
			meta: {
				query: {
					filter: {
						deleted_at: { _eq: null },
						title: { _eq: '' },
						tags: { _in: [] },
					},
				},
			},
		})

		const search = sent.map(one => decodeURIComponent(one.search)).join(' ')
		// `_eq: null` is how Directus asks for "not soft-deleted"; dropping it widens the query.
		expect(search).toContain('"deleted_at":{"_eq":null}')
		expect(search).toContain('"title":{"_eq":""}')
		expect(search).toContain('"tags":{"_in":[]}')
		expect(search).toContain('"status":{"_eq":"published"}')
	})

	it('should keep an empty-string condition on a single read', async () => {
		const { client, sent } = setup({ data: {} })
		const fetcher = createFetcher({ client })

		await fetcher.getOne({
			resource: 'posts',
			id: 7,
			meta: { query: { filter: { title: { _eq: '' } } } },
		})

		expect(decodeURIComponent(sent[0]!.search)).toContain('"title":{"_eq":""}')
	})

	it('should send no filter at all when there are no filters', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.getList({ resource: 'posts', filters: [] })

		expect(sent.map(one => decodeURIComponent(one.search)).join(' ')).not.toContain('filter=')
	})

	it('should echo what was written when Directus answers with no body', async () => {
		// Every delete answers with no body, and so does a create or update whose policy grants
		// the write but not the read-back Directus uses to build the response. Rather than hand
		// the caller an empty shell, rebuild the record from what we just sent.
		const { client } = setup({ data: null })
		const fetcher = createFetcher({ client })

		expect(await fetcher.createOne({ resource: 'posts', params: { title: 'a' } }))
			.toEqual({ data: { title: 'a' } })
		expect(await fetcher.createMany({ resource: 'posts', params: [{ title: 'a' }, { title: 'b' }] }))
			.toEqual({ data: [{ title: 'a' }, { title: 'b' }] })

		// Update and delete know the keys, so the rebuilt records are complete.
		expect(await fetcher.updateOne({ resource: 'posts', id: 7, params: { title: 'a' } }))
			.toEqual({ data: { id: 7, title: 'a' } })
		expect(await fetcher.updateMany({ resource: 'posts', ids: [7, 8], params: { title: 'a' } }))
			.toEqual({ data: [{ id: 7, title: 'a' }, { id: 8, title: 'a' }] })
		expect(await fetcher.deleteOne({ resource: 'posts', id: 7 }))
			.toEqual({ data: { id: 7 } })
		expect(await fetcher.deleteMany({ resource: 'posts', ids: [7, 8] }))
			.toEqual({ data: [{ id: 7 }, { id: 8 }] })
	})

	it('should let the id from props win over one written into params', async () => {
		const { client } = setup({ data: null })
		const fetcher = createFetcher({ client })

		const result = await fetcher.updateOne({
			resource: 'posts',
			id: 7,
			params: { id: 999, title: 'a' } as any,
		})

		expect(result).toEqual({ data: { id: 7, title: 'a' } })
	})

	it('should prefer the real body whenever Directus sends one', async () => {
		const { client } = setup({ data: { id: 7, title: 'from server' } })
		const fetcher = createFetcher({ client })

		expect(await fetcher.updateOne({ resource: 'posts', id: 7, params: { title: 'sent' } }))
			.toEqual({ data: { id: 7, title: 'from server' } })
	})

	it('should not let a caller limit truncate getMany', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.getMany({
			resource: 'posts',
			ids: [1, 2, 3, 4, 5],
			meta: { query: { limit: 2 } },
		})

		expect(decodeURIComponent(sent[0]!.search)).toContain('limit=5')
	})

	it('should route a directus_ resource to its system endpoint', async () => {
		const { client, sent } = setup({ data: [] })
		const fetcher = createFetcher({ client })

		await fetcher.getList({ resource: 'directus_users' })

		expect(sent.map(s => s.path)).toContain('/users')
	})
})
