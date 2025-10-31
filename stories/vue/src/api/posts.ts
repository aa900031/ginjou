import { faker } from '@faker-js/faker'
import { primaryKey } from '@mswjs/data'

export interface Post {
	id: string
	title: string
	status: string
}

export type PostFormData = Omit<Post, 'id'>

export type PostRawFormData = Partial<PostFormData>

export const MockModel = {
	posts: {
		id: primaryKey(faker.string.uuid),
		title: faker.word.sample,
		status: () => 'rejected',
	},
}
