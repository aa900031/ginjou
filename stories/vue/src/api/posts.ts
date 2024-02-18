import { primaryKey } from '@mswjs/data'
import { faker } from '@faker-js/faker'

export interface Post {
	id: string
	title: string
	status: string
}

export const MockModel = {
	posts: {
		id: primaryKey(faker.string.uuid),
		title: faker.word.sample,
		status: () => 'rejected',
	},
}
