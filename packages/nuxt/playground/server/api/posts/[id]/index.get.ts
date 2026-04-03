import { findPost } from '../../../utils/posts'

export default eventHandler((event) => {
	const id = getRouterParam(event, 'id')
	const post = id ? findPost(id) : undefined

	if (!post) {
		throw createError({
			statusCode: 404,
			message: 'Post not found',
		})
	}

	return post
})
