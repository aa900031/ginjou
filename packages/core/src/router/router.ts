import type { RouterBackFn, RouterGoFn } from './go'
import type { RouterGetLocationFn, RouterOnChangeLocationFn } from './location'
import type { RouterResolveFn } from './resolve'

export interface Router {
	go: RouterGoFn<unknown>
	back: RouterBackFn
	resolve: RouterResolveFn<unknown>
	getLocation: RouterGetLocationFn<unknown>
	onChangeLocation: RouterOnChangeLocationFn<unknown>
}
