import type { RouterBackFn, RouterGoFn } from './go'
import type { RouterGetLocationFn, RouterOnChangeLocationFn } from './location'
import type { RouterResolveFn } from './resolve'

export interface Router {
	go: RouterGoFn<any>
	back: RouterBackFn
	resolve: RouterResolveFn<any>
	getLocation: RouterGetLocationFn<any>
	onChangeLocation: RouterOnChangeLocationFn<any>
}
