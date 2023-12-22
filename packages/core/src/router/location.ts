export interface RouterLocation<
	TMeta = unknown,
> {
	path: string
	params?: Record<string, string | string[]>
	query?: Record<string, string | null | ((string | null)[])>
	hash?: string
	meta?: TMeta
}

export type RouterGetLocationFn<
	TMeta = unknown,
> = () => RouterLocation<TMeta>

export type RouterOnChangeLocationFn<
	TMeta = unknown,
> = (handler: (value: RouterLocation<TMeta>) => void) => () => void
