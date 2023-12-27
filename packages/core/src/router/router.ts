import type { RouterBackFn, RouterGoFn } from './go'
import type { RouterGetLocationFn, RouterOnChangeLocationFn } from './location'
import type { RouterResolveFn } from './resolve'

export interface Router<
	TGoMeta = unknown,
	TLocationMeta = unknown,
> {
	go: RouterGoFn<TGoMeta>
	back: RouterBackFn
	resolve: RouterResolveFn<TGoMeta>
	getLocation: RouterGetLocationFn<TLocationMeta>
	onChangeLocation: RouterOnChangeLocationFn<TLocationMeta>
}
