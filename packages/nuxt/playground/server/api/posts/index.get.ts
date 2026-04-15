import { listPosts } from '../../utils/posts'

export default eventHandler((event) => {
	const posts = listPosts()

	setHeader(event, 'x-total-count', String(posts.length))

	return posts
})
