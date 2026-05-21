import type { Resource } from '@ginjou/core'
import type { HttpHandler } from 'msw'
import { Collection } from '@msw/data'
import { z } from 'zod'
import mockPostsData from './mock-posts.json'
import { toHandlers } from './msw'

export const PostSchema = z.object({
	id: z.string(),
	title: z.string(),
	status: z.string(),
})

export type Post = z.infer<typeof PostSchema>
export type PostFormData = Omit<Post, 'id'>
export type PostRawFormData = Partial<PostFormData>

export const mockPosts: Post[] = mockPostsData

export const DEFAULT_POST_ID = mockPosts[0]!.id
export const MOCK_POST_IDS = mockPosts.map(p => p.id)

export const API_BASE_URL = 'https://rest-api.local'

export const postResources: Resource.Raw[] = [
	{
		name: 'posts',
		list: '/posts',
		create: '/posts/create',
		show: '/posts/:id',
		edit: '/posts/:id/edit',
	},
]

export function createPostHandlers(): HttpHandler[] {
	const posts = new Collection({ schema: PostSchema })
	for (const post of mockPosts)
		posts.create(post)
	return toHandlers(posts, 'posts', API_BASE_URL)
}
