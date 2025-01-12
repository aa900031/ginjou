import type { Access, Auth, Fetchers, I18n, Notification, Realtime, Resource, Router } from '@ginjou/core'
import type { VueQueryPluginOptions } from '@tanstack/vue-query'
import type { Plugin } from 'vue-demi'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { defineAccess } from './access'
import { defineAuthContext } from './auth'
import { defineI18nContext } from './i18n'
import { defineNotificationContext } from './notification'
import { defineFetchers } from './query'
import { defineRealtimeContext } from './realtime'
import { defineResourceContext } from './resource'
import { defineRouterContext } from './router'

export interface Options {
	i18n?: () => I18n
	router?: () => Router<any, any>
	resource?: () => Resource
	auth?: () => Auth
	access?: () => Access
	fetcher?: () => Fetchers
	realtime?: () => Realtime
	notification?: () => Notification
	query?: VueQueryPluginOptions
}

export default {
	install: (app, opts) => {
		app.use(VueQueryPlugin, opts.query)

		opts.i18n
		&& defineI18nContext(opts.i18n, app.provide)
		opts.router
		&& defineRouterContext(opts.router, app.provide)
		opts.resource
		&& defineResourceContext(opts.resource, app.provide)
		opts.auth
		&& defineAuthContext(opts.auth, app.provide)
		opts.access
		&& defineAccess(opts.access, app.provide)
		opts.fetcher
		&& defineFetchers(opts.fetcher, app.provide)
		opts.realtime
		&& defineRealtimeContext(opts.realtime, app.provide)
		opts.notification
		&& defineNotificationContext(opts.notification, app.provide)
	},
} satisfies Plugin<Options>
