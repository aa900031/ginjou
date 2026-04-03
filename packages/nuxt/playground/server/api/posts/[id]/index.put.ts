import { updatePost } from '../../../utils/posts'

export default eventHandler(async (event) => {
	const id = getRouterParam(event, 'id')
	const body = await readBody<{ name?: string, user?: string }>(event)

	if (!id) {
		throw createError({
			statusCode: 400,
			message: 'Post id is required',
		})
	}

	const post = updatePost(id, body ?? {})

	if (!post) {
		throw createError({
			statusCode: 404,
			message: 'Post not found',
		})
	}

	return post
})
