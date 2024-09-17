import { defineComponent, h } from 'vue'
import { useRoute } from 'vue-router'

export const PostList = defineComponent(() => {
	return () => h('h1', 'Post List')
}, {
	name: 'PostList',
})

export const PostShow = defineComponent(() => {
	const route = useRoute()
	return () => [
		h('h1', 'Post Show'),
		h('p', route.params.id),
	]
}, {
	name: 'PostShow',
})

export const PostEdit = defineComponent(() => {
	const route = useRoute()
	return () => [
		h('h1', 'Post Edit'),
		h('p', route.params.id),
	]
}, {
	name: 'PostEdit',
})

export const PostCreate = defineComponent(() => {
	return () => h('h1', 'Post Create')
}, {
	name: 'PostCreate',
})
