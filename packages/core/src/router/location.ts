export interface RouterLocation<
	TMeta = unknown,
> {
	path: string
	/**
	 * Object of decoded params extracted from the `path`.
	 */
	params?: Record<string, string | string[]>
	query?: Record<string, string | null | ((string | null)[])>
	hash?: string
	meta?: TMeta
}

export type RouterGetLocationFn<
	TMeta,
> = () => RouterLocation<TMeta>

export type RouterOnChangeLocationFn<
	TMeta,
> = (
	handler: (value: RouterLocation<TMeta>) => void,
) => () => void
