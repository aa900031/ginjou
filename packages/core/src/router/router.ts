import type { RouterBackFn, RouterGoFn } from './go'
import type { RouterGetLocationFn, RouterOnChangeLocationFn } from './location'

export interface Router<
	TGoMeta = unknown,
	TLocationMeta = unknown,
> {
	go: RouterGoFn<TGoMeta>
	back: RouterBackFn
	getLocation: RouterGetLocationFn<TLocationMeta>
	onChangeLocation: RouterOnChangeLocationFn<TLocationMeta>
}
