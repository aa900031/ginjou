<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
	collapsed?: boolean
}>()

const workspaces = ref([
	{
		label: 'Ginjou Core',
		avatar: {
			src: 'https://github.com/nuxt.png',
			alt: 'Ginjou Core',
		},
	},
	{
		label: 'Orders Demo',
		avatar: {
			src: 'https://github.com/nuxtlabs.png',
			alt: 'Orders Demo',
		},
	},
])

const selectedWorkspace = ref(workspaces.value[1])

const items = computed<DropdownMenuItem[][]>(() => ([
	workspaces.value.map(workspace => ({
		...workspace,
		onSelect() {
			selectedWorkspace.value = workspace
		},
	})),
]))
</script>

<template>
	<UDropdownMenu
		:items="items"
		:content="{ align: 'center', collisionPadding: 12 }"
		:ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
	>
		<UButton
			v-bind="{
				...selectedWorkspace,
				label: collapsed ? undefined : selectedWorkspace?.label,
				trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
			}"
			color="neutral"
			variant="ghost"
			block
			:square="collapsed"
			class="data-[state=open]:bg-elevated"
			:class="[!collapsed && 'py-2']"
		/>
	</UDropdownMenu>
</template>
