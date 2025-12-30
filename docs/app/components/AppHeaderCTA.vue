<script setup lang="ts">
const routeToStorbyook = 'https://ginjou-storybook.pages.dev'
</script>

<template>
	<div class="hidden lg:block">
		<UButton
			class="p-1.5"
			icon="i-simple-icons-storybook"
			:to="routeToStorbyook"
			color="neutral"
			variant="ghost"
			target="_blank"
			rel="noreferrer noopener"
		/>
	</div>
</template>
