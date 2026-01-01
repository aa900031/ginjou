<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
	<span class="font-extrabold text-xl lg:text-2xl h-auto hover:text-primary">
		{{ appConfig.header?.title || '{appConfig.header.title}' }}
	</span>
</template>
