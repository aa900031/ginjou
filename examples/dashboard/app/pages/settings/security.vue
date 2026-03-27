<script setup lang="ts">
import * as z from 'zod'
import type { FormError } from '@nuxt/ui'

const schema = z.object({
	current: z.string().min(8, 'Must be at least 8 characters'),
	new: z.string().min(8, 'Must be at least 8 characters'),
})

type Schema = z.output<typeof schema>

const password = reactive<Partial<Schema>>({
	current: '',
	new: '',
})

const validate = (state: Partial<Schema>): FormError[] => {
	const errors: FormError[] = []

	if (state.current && state.new && state.current === state.new) {
		errors.push({ name: 'new', message: 'Passwords must be different' })
	}

	return errors
}
</script>

<template>
	<UPageCard title="Password" description="Keep the demo account secure." variant="subtle">
		<UForm :schema="schema" :state="password" :validate="validate" class="flex max-w-xs flex-col gap-4">
			<UFormField name="current">
				<UInput v-model="password.current" type="password" placeholder="Current password" class="w-full" />
			</UFormField>
			<UFormField name="new">
				<UInput v-model="password.new" type="password" placeholder="New password" class="w-full" />
			</UFormField>
			<UButton label="Update" class="w-fit" type="submit" />
		</UForm>
	</UPageCard>

	<UPageCard title="Danger zone" description="The example keeps a visible account action for parity with the template." class="bg-gradient-to-tl from-error/10 from-5% to-default">
		<template #footer>
			<UButton label="Delete account" color="error" />
		</template>
	</UPageCard>
</template>
