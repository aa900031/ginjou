<script setup lang="ts">
type BadgeColor = 'success' | 'warning' | 'neutral'
const badgeColors = {
	paid: 'success',
	pending: 'warning',
	refunded: 'neutral',
} as const satisfies Record<'paid' | 'pending' | 'refunded', BadgeColor>

const props = defineProps<{
	status: 'paid' | 'pending' | 'refunded'
}>()

const color = computed(() => badgeColors[props.status])
</script>

<template>
	<UBadge :color="color" variant="subtle" class="capitalize">
		{{ status }}
	</UBadge>
</template>
