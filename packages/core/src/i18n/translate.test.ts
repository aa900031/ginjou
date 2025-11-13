import type { I18n } from './i18n'
import { describe, expect, it, vi } from 'vitest'
import { createTranslateFn } from './translate'

describe('createTranslateFn', () => {
	it('should return a function that returns the key if i18n is not provided', () => {
		const translate = createTranslateFn({})
		expect(translate('my.key')).toBe('my.key')
	})

	it('should return a function that returns the default value if i18n is not provided', () => {
		const translate = createTranslateFn({})
		expect(translate('my.key', undefined, 'My Default')).toBe('My Default')
	})

	it('should use i18n.translate if i18n is provided', () => {
		const i18n = {
			translate: vi.fn().mockReturnValue('Translated Value'),
		} as unknown as I18n
		const translate = createTranslateFn({ i18n })
		const result = translate('my.key', { name: 'test' })

		expect(i18n.translate).toHaveBeenCalledWith('my.key', { name: 'test' })
		expect(result).toBe('Translated Value')
	})

	it('should fallback to default value if i18n.translate returns undefined', () => {
		const i18n = {
			translate: vi.fn().mockReturnValue(undefined),
		} as unknown as I18n
		const translate = createTranslateFn({ i18n })
		const result = translate('my.key', { name: 'test' }, 'My Default')

		expect(i18n.translate).toHaveBeenCalledWith('my.key', { name: 'test' })
		expect(result).toBe('My Default')
	})

	it('should fallback to key if i18n.translate returns undefined and no default value is provided', () => {
		const i18n = {
			translate: vi.fn().mockReturnValue(undefined),
		} as unknown as I18n
		const translate = createTranslateFn({ i18n })
		const result = translate('my.key', { name: 'test' })

		expect(i18n.translate).toHaveBeenCalledWith('my.key', { name: 'test' })
		expect(result).toBe('my.key')
	})
})
