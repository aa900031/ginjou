import type { Resource } from '@ginjou/core'
import type { HttpHandler } from 'msw'
import type { Post } from '../api/posts'
import { Collection } from '@msw/data'
import mockPosts from '../../data/mock-posts.json'
import { PostSchema } from '../api/posts'
import { toHandlers } from './msw-data'

export const API_BASE_URL = 'https://rest-api.local'
export const DEFAULT_POST_ID = mockPosts[0]!.id
export const mockPostIds = (mockPosts as Post[]).map(p => p.id)

export const postResources = [
	{
		name: 'posts',
		list: '/posts',
		create: '/posts/create',
		show: '/posts/:id',
		edit: '/posts/:id/edit',
	},
] satisfies Resource.Raw[]

export function createPostHandlers(): HttpHandler[] {
	const posts = new Collection({
		schema: PostSchema,
	})

	for (const post of mockPosts as Post[])
		posts.create(post)

	return toHandlers(posts, 'posts', API_BASE_URL)
}
