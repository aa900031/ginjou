<script setup lang="ts">
const routeToStorbyook = 'https://ginjou-storybook.pages.dev'
</script>

<template>
	<div class="hidden lg:block">
		<UButton
			class="p-1.5"
			:to="routeToStorbyook"
			color="neutral"
			variant="ghost"
			target="_blank"
			rel="noreferrer noopener"
			icon="i-simple-icons-storybook"
			:ui="{
				base: 'group',
				leadingIcon: 'group-hover:text-pink-500',
			}"
		/>
	</div>
</template>
