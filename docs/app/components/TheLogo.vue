<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
	<div class="flex justify-center">
		<NuxtImg
			class="max-w-64"
			:src="appConfig.assets.logo"
		/>
	</div>
</template>
