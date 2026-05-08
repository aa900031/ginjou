<script setup lang="ts">
import { useLocale, useTranslate } from '@ginjou/vue'
import Card from './components/Card.vue'
import FieldLabel from './components/FieldLabel.vue'
import JsonOutput from './components/JsonOutput.vue'
import PageTitle from './components/PageTitle.vue'
import Select from './components/Select.vue'
import Stack from './components/Stack.vue'
import StoryShell from './components/StoryShell.vue'

const locale = useLocale()
const t = useTranslate()
</script>

<template>
	<StoryShell>
		<Stack>
			<PageTitle>useLocale / useTranslate</PageTitle>

			<Card>
				<Stack>
					<JsonOutput :value="{ 'hi': t('hi'), 'msg': t('msg', { name: 'Mark' }) }" />
					<FieldLabel>
						<span>Locale</span>
						<Select
							v-model="locale"
							data-testid="locale-selector"
						>
							<option value="en-US">
								en-US
							</option>
							<option value="zh-TW">
								zh-TW
							</option>
						</Select>
					</FieldLabel>
				</Stack>
			</Card>
		</Stack>
	</StoryShell>
</template>
