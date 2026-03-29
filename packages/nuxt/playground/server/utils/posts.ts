export interface PostRecord {
	id: string
	name: string
	user: string
}

const posts: PostRecord[] = [
	{
		id: '1',
		name: 'posts-1',
		user: '1',
	},
	{
		id: '2',
		name: 'posts-2',
		user: '2',
	},
]

export function listPosts(): PostRecord[] {
	return posts
}

export function findPost(id: string): PostRecord | undefined {
	return posts.find(post => post.id === id)
}

export function createPost(name: string): PostRecord {
	const nextId = String(
		posts.reduce((maxId, post) => Math.max(maxId, Number(post.id)), 0) + 1,
	)

	const post = {
		id: nextId,
		name,
		user: '1',
	}

	posts.push(post)

	return post
}

export function updatePost(id: string, payload: Partial<Omit<PostRecord, 'id'>>): PostRecord | undefined {
	const post = findPost(id)

	if (!post)
		return undefined

	if (payload.name != null)
		post.name = payload.name

	if (payload.user != null)
		post.user = payload.user

	return post
}
