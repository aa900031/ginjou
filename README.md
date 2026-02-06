<p align="center">
	<img alt="Ginjou Logo" width="256" src="https://cdn.jsdelivr.net/gh/aa900031/ginjou@docs%2Fimprove-document-content-with-ai/assets/logo.svg">
</p>

<br/>

<h1 align="center">
  Ginjou
</h1>

<div align="center">

[![Coverage](https://img.shields.io/codecov/c/gh/aa900031/ginjou?label=Coverage&logo=codecov&style=flat&colorA=18181B&colorB=F0DB4F)](https://codecov.io/gh/aa900031/ginjou)
![CodeRabbit](https://img.shields.io/coderabbit/prs/github/aa900031/ginjou?style=flat&logo=coderabbit&logoColor=FF570A&label=CodeRabbit%20Reviews&colorA=18181B&colorB=F0DB4F)
[![Socket Secure](https://badge.socket.dev/npm/package/@ginjou/core)](https://socket.dev/npm/package/@ginjou/core)
[![CodSpeed Benchmarks](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://codspeed.io/aa900031/ginjou)

</div>

<br>

Ginjou is a headless, framework-agnostic, progressive  library for building admin panels, dashboards, and other data-intensive applications. It is inspired by [refine](https://github.com/refinedev/refine) and [react-admin](https://github.com/marmelab/react-admin)

## Features

*   **Framework-Agnostic:** Use it with Vue, Nuxt, or bring your own framework.
*   **Any Backend:** Connect to any backend with ease. Pre-built providers for REST APIs, Supabase, and Directus are available.
*   **Authentication & Authorization:** Manage user sessions and control access to resources.
*   **Realtime Streaming:** Automatically update state when content changes.

## Quick Start

Here's a quick example of how to use Ginjou with Vue.

**1. Installation**

```bash
pnpm add @ginjou/vue @tanstack/vue-query
```

**2. Usage**

```html
<script setup lang="ts">
import { defineFetchersContext, defineQueryClient, useList } from '@ginjou/vue'

defineQueryClientContext(
	new QueryClient()
)
defineFetchersContext({
	default: {
		getList: ({ resource, pagination, filters }) => {
			const resp = await fetch(`/api/${resource}`, {
				filters,
				pagination,
			})
			const data = await resp.json()
			return data
		},
	},
})
</script>

<template>
	<PostList />
</template>
```

```html
<!-- PostList.vue -->
<script setup lang="ts">
import { useList } from '@ginjou/vue'

const { data, isLoading, isError } = useList({ resource: 'posts' })
</script>

<template>
	<div v-if="isLoading">
		Loading...
	</div>
	<div v-if="isError">
		Error fetching posts!
	</div>
	<ul v-if="data">
		<li v-for="post in data.data" :key="post.id">
			{{ post.title }}
		</li>
	</ul>
</template>
```

## Packages

### Core

| Package | Version | Downloads |
| --- | --- | --- |
| [`@ginjou/core`](https://www.npmjs.com/package/@ginjou/core) | [![npm version](https://img.shields.io/npm/v/@ginjou/core?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/core) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/core?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/core) |

### Vue

| Package | Version | Downloads |
| --- | --- | --- |
| [`@ginjou/vue`](https://www.npmjs.com/package/@ginjou/vue) | [![npm version](https://img.shields.io/npm/v/@ginjou/vue?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/vue) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/vue?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/vue) |
| [`@ginjou/nuxt`](https://www.npmjs.com/package/@ginjou/nuxt) | [![npm version](https://img.shields.io/npm/v/@ginjou/nuxt?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/nuxt) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/nuxt?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/nuxt)|
| [`@ginjou/with-vue-i18n`](https://www.npmjs.com/package/@ginjou/with-vue-i18n) | [![npm version](https://img.shields.io/npm/v/@ginjou/with-vue-i18n?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-vue-i18n) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/with-vue-i18n?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-vue-i18n) |
| [`@ginjou/with-vue-router`](https://www.npmjs.com/package/@ginjou/with-vue-router) | [![npm version](https://img.shields.io/npm/v/@ginjou/with-vue-router?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-vue-router) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/with-vue-router?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-vue-router) |

### Integrations

| Package | Version | Downloads |
| --- | --- | --- |
| [`@ginjou/with-directus`](https://www.npmjs.com/package/@ginjou/with-directus) | [![npm version](https://img.shields.io/npm/v/@ginjou/with-directus?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-directus) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/with-directus?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-directus) |
| [`@ginjou/with-rest-api`](https://www.npmjs.com/package/@ginjou/with-rest-api) | [![npm version](https://img.shields.io/npm/v/@ginjou/with-rest-api?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-rest-api) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/with-rest-api?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-rest-api) |
| [`@ginjou/with-supabase`](https://www.npmjs.com/package/@ginjou/with-supabase) | [![npm version](https://img.shields.io/npm/v/@ginjou/with-supabase?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-supabase) | [![npm downloads](https://img.shields.io/npm/dm/@ginjou/with-supabase?style=flat&colorA=18181B&colorB=F0DB4F)](https://www.npmjs.com/package/@ginjou/with-supabase) |

## License

Made with ❤️

Published under the [MIT License](https://github.com/aa900031/ginjou/blob/main/LICENSE).
