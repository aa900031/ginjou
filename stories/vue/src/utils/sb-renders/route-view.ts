import { h } from 'vue'
import { RouterView } from 'vue-router'

export function renderRouteView(args: any) {
	return () => h(RouterView, args)
}
