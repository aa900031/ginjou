/* eslint-disable no-console */
import { beforeEach } from 'vitest'
import type { Fetchers } from '@ginjou/core'
import { QueryClient } from '@tanstack/vue-query'

export const MockPosts = [
	{
		id: '1',
		title: 'Necessitatibus necessitatibus id et cupiditate provident est qui amet.',
		slug: 'ut-ad-et',
		content:
			'Cupiditate labore quaerat cum incidunt vel et consequatur modi illo. Et maxime aut commodi occaecati omnis. Est voluptatem quibusdam aliquam. Esse tenetur omnis eaque. Consequatur necessitatibus illum ipsum aspernatur architecto qui. Ut temporibus qui nobis. Reiciendis est magnam ipsa quasi dolor ipsa error. Et eaque cumque est. Eos et odit corporis delectus aut corrupti tempora velit. Perferendis ratione voluptas corrupti id temporibus nam.',
		categoryId: 1,
		status: 'active',
		userId: 5,
		tags: [16, 31, 45],
		nested: {
			title: 'Necessitatibus necessitatibus id et cupiditate provident est qui amet.',
		},
	},
	{
		id: '2',
		title: 'Recusandae consectetur aut atque est.',
		slug: 'consequatur-molestiae-rerum',
		content:
			'Quia ut autem. Hic dolorum magni est quisquam. Modi est id et est. Est sapiente velit iure non voluptatem natus enim. Distinctio ipsa repellendus est. Sunt ipsam dignissimos vero error est cumque eaque. Consequatur voluptas suscipit optio incidunt doloremque quia harum harum. Totam voluptatibus aperiam quia. Est omnis deleniti et aut at fugit temporibus debitis modi. Magni aut vel quod magnam.',
		categoryId: 38,
		status: 'active',
		userId: 36,
		tags: [16, 30, 46],
		nested: {
			title: 'Recusandae consectetur aut atque est.',
		},
	},
]

export const MockFetchers = {
	default: {
		create: () => Promise.resolve({ data: MockPosts[0] }),
		createMany: () => Promise.resolve({ data: MockPosts }),
		deleteOne: () => Promise.resolve({ data: MockPosts[0] }),
		deleteMany: () => Promise.resolve({ data: [] }),
		getList: () => Promise.resolve({ data: MockPosts, total: 2 }),
		getMany: () => Promise.resolve({ data: [...MockPosts] }),
		getOne: () => Promise.resolve({ data: MockPosts[0] }),
		update: () => Promise.resolve({ data: MockPosts[0] }),
		updateMany: () => Promise.resolve({ data: [] }),
		custom: () => Promise.resolve({ data: MockPosts[0] }),
	},
} as Fetchers

export const queryClient = new QueryClient({
	logger: {
		log: console.log,
		warn: console.warn,
		error: () => {
			return {}
		},
	},
	defaultOptions: {
		queries: {
			cacheTime: 0,
			retry: 0,
		},
	},
})

export const contexts = {
	queryClient,
	fetchers: MockFetchers,
}

beforeEach(() => {
	queryClient.clear()
})
