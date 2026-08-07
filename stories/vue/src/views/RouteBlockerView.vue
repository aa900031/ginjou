<script setup lang="ts">
import { useGo, useRouteBlocker } from '@ginjou/vue'
import { ref } from 'vue'
import Button from '../components/Button.vue'
import Card from '../components/Card.vue'
import InlineActions from '../components/InlineActions.vue'
import LocaleBadge from '../components/LocaleBadge.vue'
import PageTitle from '../components/PageTitle.vue'
import Stack from '../components/Stack.vue'

const enabled = ref(true)
const shouldBlock = ref(true)

const blocker = useRouteBlocker({ enabled, shouldBlock })
const go = useGo()
</script>

<template>
	<Stack>
		<LocaleBadge />
		<PageTitle>Route Blocker</PageTitle>

		<Card>
			No confirm dialog here: a held navigation waits until Proceed or Reset is pressed, so every
			step of the state machine is visible. Turn <strong>shouldBlock</strong> off to let
			navigations through while the blocker stays registered, or turn <strong>enabled</strong>
			off to unregister it entirely.
		</Card>

		<Card>
			State: <strong data-testid="state">{{ blocker.state.value }}</strong>
		</Card>

		<InlineActions>
			<Button type="button" @click="enabled = !enabled">
				enabled: {{ enabled }}
			</Button>
			<Button type="button" @click="shouldBlock = !shouldBlock">
				shouldBlock: {{ shouldBlock }}
			</Button>
		</InlineActions>

		<InlineActions>
			<Button
				type="button"
				:disabled="blocker.state.value !== 'blocked'"
				@click="blocker.proceed()"
			>
				Proceed
			</Button>
			<Button
				type="button"
				:disabled="blocker.state.value !== 'blocked'"
				@click="blocker.reset()"
			>
				Reset
			</Button>
		</InlineActions>

		<InlineActions>
			<Button type="button" @click="go({ to: '/posts' })">
				Go to list
			</Button>
			<Button type="button" @click="go({ to: '/posts/1' })">
				Go to show
			</Button>
			<Button type="button" @click="go({ to: '/blocker', query: { page: '2' } })">
				Change query only
			</Button>
		</InlineActions>
	</Stack>
</template>
