import { getCurrentInstance, provide } from 'vue'
import type { RouteRecordRaw, Router } from 'vue-router'
import { createRouter as createVueRouter, createWebHistory } from 'vue-router'
import type { Fetchers, ResourceDefinition } from '@ginjou/core'
import { defineFetchers, defineResourceContext, defineRouterContext } from '@ginjou/vue'
import { defineRouterBinding } from '@ginjou/with-vue-router'
import { QueryClient } from '@tanstack/vue-query'
import type { Decorator } from '@storybook/vue3'

export type CreateWrapperProps =
	& {
		fetchers?: Fetchers
		resources?: ResourceDefinition[]
		queryClient?: QueryClient
	}
	& CreateRouterProps

export function createWrapper(
	props?: CreateWrapperProps,
): Decorator {
	const inited = new WeakSet()

	const resolved = {
		fetchers: props?.fetchers ?? createFetchers(),
		queryClient: props?.queryClient ?? new QueryClient(),
		router: createRouter(props),
		resources: props?.resources,
	} as const

	return () => ({
		setup: () => {
			const { app } = getCurrentInstance()!.appContext

			for (const [key, value] of Object.entries(resolved)) {
				if (value == null || inited.has(value))
					continue

				inited.add(value)

				switch (key) {
					case 'queryClient':
						provide('VUE_QUERY_CLIENT', value)
						break
					case 'fetchers':
						defineFetchers(value as any)
						break
					case 'resources':
						defineResourceContext({
							resources: value as any,
						})
						break
					case 'router':
						app.use(value as any)
						app.runWithContext(() => defineRouterContext(defineRouterBinding()))
						;(value as Router).replace('/')
						break
				}
			}
		},
		template: '<story />',
	})
}

interface CreateRouterProps {
	router?: boolean | Router
	routes?: RouteRecordRaw[]
}

function createRouter(
	props?: CreateRouterProps,
) {
	return props?.router === true || props?.routes
		? createVueRouter({
			history: createWebHistory(),
			routes: props.routes ?? [],
		})
		: props?.router === false
			? undefined
			: props?.router
}

function createFetchers(): Fetchers {
	return {
		default: {
			getList: async ({ resource }) => {
				switch (resource) {
					case 'posts':
						return {
							data: [
								{
									id: '1',
									name: 'ya',
								},
								{
									id: '2',
									name: 'ya2',
								},
							],
							total: 2,
						} as any

					default:
						throw new Error('No')
				}
			},
		},
	}
}
