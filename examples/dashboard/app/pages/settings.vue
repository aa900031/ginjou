<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [[
	{ label: 'General', icon: 'i-lucide-user', to: '/settings', exact: true },
	{ label: 'Notifications', icon: 'i-lucide-bell', to: '/settings/notifications' },
	{ label: 'Security', icon: 'i-lucide-shield', to: '/settings/security' },
], [
	{ label: 'Orders', icon: 'i-lucide-package', to: '/orders' },
]] satisfies NavigationMenuItem[][]
</script>

<template>
	<UDashboardPanel id="settings" :ui="{ body: 'lg:py-12' }">
		<template #header>
			<UDashboardNavbar title="Settings">
				<template #leading>
					<UDashboardSidebarCollapse />
				</template>
			</UDashboardNavbar>

			<UDashboardToolbar>
				<UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
			</UDashboardToolbar>
		</template>

		<template #body>
			<div class="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-6 lg:gap-12">
				<NuxtPage />
			</div>
		</template>
	</UDashboardPanel>
</template>
