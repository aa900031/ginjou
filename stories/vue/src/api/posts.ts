import { z } from 'zod'

export const PostSchema = z.object({
	id: z.string(),
	title: z.string(),
	status: z.string(),
})

export type Post = z.infer<typeof PostSchema>
export type PostFormData = Omit<Post, 'id'>
export type PostRawFormData = Partial<PostFormData>
