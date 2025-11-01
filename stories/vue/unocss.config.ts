import type { UserConfig } from 'unocss'
import {
	defineConfig,
	presetIcons,
	presetMini,
	presetTypography,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss'

export default defineConfig({
	presets: [
		presetMini(),
		presetIcons(),
		presetTypography(),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
	],
}) satisfies UserConfig
