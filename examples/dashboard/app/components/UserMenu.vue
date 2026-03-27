<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
	collapsed?: boolean
}>()

const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const user = ref({
	name: 'Ginjou Demo',
	avatar: {
		src: 'https://github.com/aa900031.png',
		alt: 'Ginjou Demo',
	},
})

const items = computed<DropdownMenuItem[][]>(() => ([
	[{ type: 'label', label: user.value.name, avatar: user.value.avatar }],
	[
		{ label: 'Orders', icon: 'i-lucide-package', to: '/orders' },
		{ label: 'Settings', icon: 'i-lucide-settings', to: '/settings' },
	],
	[
		{
			label: 'Theme',
			icon: 'i-lucide-palette',
			children: [
				{
					label: 'Primary',
					slot: 'chip',
					chip: appConfig.ui.colors.primary,
					children: colors.map(color => ({
						label: color,
						chip: color,
						slot: 'chip',
						type: 'checkbox',
						checked: appConfig.ui.colors.primary === color,
						onSelect: (event: Event) => {
							event.preventDefault()
							appConfig.ui.colors.primary = color
						},
					})),
				},
				{
					label: 'Neutral',
					slot: 'chip',
					chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
					children: neutrals.map(color => ({
						label: color,
						chip: color === 'neutral' ? 'old-neutral' : color,
						slot: 'chip',
						type: 'checkbox',
						checked: appConfig.ui.colors.neutral === color,
						onSelect: (event: Event) => {
							event.preventDefault()
							appConfig.ui.colors.neutral = color
						},
					})),
				},
			],
		},
		{
			label: 'Appearance',
			icon: 'i-lucide-sun-moon',
			children: [
				{
					label: 'Light',
					icon: 'i-lucide-sun',
					type: 'checkbox',
					checked: colorMode.value === 'light',
					onSelect(event: Event) {
						event.preventDefault()
						colorMode.preference = 'light'
					},
				},
				{
					label: 'Dark',
					icon: 'i-lucide-moon',
					type: 'checkbox',
					checked: colorMode.value === 'dark',
					onSelect(event: Event) {
						event.preventDefault()
						colorMode.preference = 'dark'
					},
				},
			],
		},
	],
	[
		{ label: 'Nuxt UI Template', icon: 'i-simple-icons-github', to: 'https://github.com/nuxt-ui-templates/dashboard', target: '_blank' },
		{ label: 'Ginjou', icon: 'i-simple-icons-github', to: 'https://github.com/aa900031/ginjou', target: '_blank' },
	],
	]))
</script>

<template>
	<UDropdownMenu
		:items="items"
		:content="{ align: 'center', collisionPadding: 12 }"
		:ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
	>
		<UButton
			v-bind="{
				...user,
				label: collapsed ? undefined : user?.name,
				trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
			}"
			color="neutral"
			variant="ghost"
			block
			:square="collapsed"
			class="data-[state=open]:bg-elevated"
		/>

		<template #chip-leading="{ item }">
			<div class="inline-flex items-center justify-center shrink-0 size-5">
				<span
					class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
					:style="{
						'--chip-light': `var(--color-${(item as any).chip}-500)`,
						'--chip-dark': `var(--color-${(item as any).chip}-400)`,
					}"
				/>
			</div>
		</template>
	</UDropdownMenu>
</template>
