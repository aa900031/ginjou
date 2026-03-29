<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({
	redirect: '/posts',
})

const { mutate: logout } = useLogout()
const { data: authenticated } = await useAsyncAuthenticated()

if (!unref(authenticated)?.authenticated) {
	throw createError({
		status: 401,
		statusText: 'Unauthorized',
		fatal: true,
	})
}

const navItems: NavigationMenuItem[] = [{
	label: 'Posts',
	icon: 'i-lucide-file-text',
	to: '/posts',
}]
</script>

<template>
	<UDashboardGroup unit="rem">
		<UDashboardSidebar
			collapsible
			resizable
			:ui="{ footer: 'lg:border-t lg:border-default' }"
		>
			<template #header="{ collapsed }">
				<div class="flex items-center gap-2 px-1">
					<UIcon
						name="i-lucide-shopping-cart"
						class="size-5 text-primary shrink-0"
					/>
					<span
						v-if="!collapsed"
						class="font-semibold truncate"
					>E-Commerce</span>
				</div>
			</template>

			<template #default="{ collapsed }">
				<UNavigationMenu
					:collapsed="collapsed"
					:items="navItems"
					orientation="vertical"
					tooltip
				/>
			</template>

			<template #footer="{ collapsed }">
				<UButton
					:label="collapsed ? undefined : 'Logout'"
					icon="i-lucide-log-out"
					color="neutral"
					variant="ghost"
					:block="!collapsed"
					class="w-full"
					@click="logout()"
				/>
			</template>
		</UDashboardSidebar>

		<NuxtPage />
	</UDashboardGroup>
</template>
