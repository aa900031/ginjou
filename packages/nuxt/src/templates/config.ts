import type { Resolver } from '@nuxt/kit'
import type { Nuxt, NuxtTemplate } from '@nuxt/schema'
import type { Options } from '../module'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

export function createConfigTemplate(
	props: {
		key: keyof Options
		filename: string
		nuxt: Nuxt
		resolve: Resolver['resolve']
		options: Options
		fallback?: string
	},
): {
		paths: {
			src: string
			nitro: string
		} | undefined
		template: NuxtTemplate
	} {
	const opt = props.options[props.key]
	const paths = typeof opt === 'string'
		? {
				src: props.resolve(props.nuxt.options.srcDir, opt),
				nitro: toNitroPath(props.nuxt.options.rootDir, props.resolve(props.nuxt.options.buildDir, props.filename)),
			}
		: undefined

	return {
		paths,
		template: {
			filename: props.filename,
			getContents: async () => {
				if (opt === false)
					return `export default undefined`

				if (typeof opt === 'string' && paths != null) {
					const content = await loadContent(paths.src)
					if (content)
						return content
				}

				return props.fallback ?? `export default undefined`
			},
			write: true,
		},
	}
}

async function loadContent(
	path: string,
): Promise<string | undefined> {
	if (existsSync(path))
		return (await readFile(path)).toString()
}

function toNitroPath(
	base: string,
	full: string,
): string {
	return full.replace(base, 'root').replaceAll('/', ':')
}
