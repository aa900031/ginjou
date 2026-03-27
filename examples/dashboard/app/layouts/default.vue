<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const open = ref(false)

defineShortcuts({
	'g-h': () => navigateTo('/'),
	'g-o': () => navigateTo('/orders'),
	'g-s': () => navigateTo('/settings'),
})

const links = [[
	{
		label: 'Home',
		icon: 'i-lucide-house',
		to: '/',
		onSelect: () => {
			open.value = false
		},
	},
	{
		label: 'Orders',
		icon: 'i-lucide-package',
		to: '/orders',
		onSelect: () => {
			open.value = false
		},
	},
	{
		label: 'Settings',
		icon: 'i-lucide-settings',
		to: '/settings',
		defaultOpen: true,
		type: 'trigger',
		children: [
			{
				label: 'General',
				to: '/settings',
				exact: true,
				onSelect: () => {
					open.value = false
				},
			},
			{
				label: 'Notifications',
				to: '/settings/notifications',
				onSelect: () => {
					open.value = false
				},
			},
			{
				label: 'Security',
				to: '/settings/security',
				onSelect: () => {
					open.value = false
				},
			},
		],
	},
], [
	{
		label: 'Template Source',
		icon: 'i-simple-icons-github',
		to: 'https://github.com/nuxt-ui-templates/dashboard',
		target: '_blank',
	},
	{
		label: 'Current Page',
		icon: 'i-lucide-file-code-2',
		to: route.path,
		onSelect: () => {
			open.value = false
		},
	},
]] satisfies NavigationMenuItem[][]

const groups = computed(() => ([
	{
		id: 'links',
		label: 'Go to',
		items: links.flat().filter(item => 'to' in item && typeof item.to === 'string' && item.to.startsWith('/')),
	},
]))
</script>

<template>
	<UDashboardGroup unit="rem">
		<UDashboardSidebar
			id="default"
			v-model:open="open"
			collapsible
			resizable
			class="bg-elevated/25"
			:ui="{ footer: 'lg:border-t lg:border-default' }"
		>
			<template #header="{ collapsed }">
				<TeamsMenu :collapsed="collapsed" />
			</template>

			<template #default="{ collapsed }">
				<UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

				<UNavigationMenu
					:collapsed="collapsed"
					:items="links[0]"
					orientation="vertical"
					tooltip
					popover
				/>

				<UNavigationMenu
					:collapsed="collapsed"
					:items="links[1]"
					orientation="vertical"
					tooltip
					class="mt-auto"
				/>
			</template>

			<template #footer="{ collapsed }">
				<UserMenu :collapsed="collapsed" />
			</template>
		</UDashboardSidebar>

		<UDashboardSearch :groups="groups" />

		<slot />
	</UDashboardGroup>
</template>
