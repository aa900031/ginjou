<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

definePageMeta({
	layout: 'auth',
})

const toast = useToast()
const { mutateAsync: login } = useLogin()

const schema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(1, 'Password is required'),
})

type Schema = z.output<typeof schema>

const fields = [{
	name: 'email',
	type: 'text' as const,
	label: 'Email',
	placeholder: 'admin@example.com',
	required: true,
}, {
	name: 'password',
	type: 'password' as const,
	label: 'Password',
	placeholder: 'Enter your password',
}]

async function onSubmit(payload: FormSubmitEvent<Schema>) {
	try {
		await login(payload.data)
	}
	catch {
		toast.add({
			title: 'Login failed',
			description: 'Invalid email or password.',
			color: 'error',
			icon: 'i-lucide-circle-x',
		})
	}
}
</script>

<template>
	<UAuthForm
		:fields="fields"
		:schema="schema"
		title="Welcome back"
		icon="i-lucide-lock"
		submit-button-options="{ label: 'Sign in' }"
		@submit="onSubmit"
	>
		<template #description>
			Sign in to your account to continue.
		</template>
	</UAuthForm>
</template>
