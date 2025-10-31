import type { UserConfig } from 'unocss'
import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss'

export default defineConfig({
	presets: [
		presetWind3(),
		presetIcons(),
		presetTypography(),
	],
	transformers: [
		transformerDirectives(),
		transformerVariantGroup(),
	],
}) satisfies UserConfig
