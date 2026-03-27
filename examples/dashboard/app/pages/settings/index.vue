<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
	name: z.string().min(2, 'Too short'),
	email: z.string().email('Invalid email'),
	team: z.string().min(2, 'Too short'),
})

type Schema = z.output<typeof schema>

const profile = reactive<Partial<Schema>>({
	name: 'Orders team',
	email: 'ops@example.com',
	team: 'Warehouse West',
})

const toast = useToast()

function onSubmit(event: FormSubmitEvent<Schema>) {
	toast.add({
		title: 'Settings updated',
		description: `Saved ${event.data.team}.`,
		color: 'success',
	})
}
</script>

<template>
	<UForm id="settings-profile" :schema="schema" :state="profile" @submit="onSubmit">
		<UPageCard title="Operations profile" description="Lightweight settings page kept from the dashboard shell." variant="naked" orientation="horizontal" class="mb-4">
			<UButton form="settings-profile" type="submit" color="neutral" label="Save changes" class="w-fit lg:ms-auto" />
		</UPageCard>

		<UPageCard variant="subtle">
			<UFormField name="name" label="Name" description="Visible to internal operators." class="flex max-sm:flex-col justify-between items-start gap-4">
				<UInput v-model="profile.name" autocomplete="off" />
			</UFormField>
			<USeparator />
			<UFormField name="email" label="Email" description="Receives order alerts." class="flex max-sm:flex-col justify-between items-start gap-4">
				<UInput v-model="profile.email" type="email" autocomplete="off" />
			</UFormField>
			<USeparator />
			<UFormField name="team" label="Team" description="Used to scope dashboard ownership." class="flex max-sm:flex-col justify-between items-start gap-4">
				<UInput v-model="profile.team" autocomplete="off" />
			</UFormField>
		</UPageCard>
	</UForm>
</template>
