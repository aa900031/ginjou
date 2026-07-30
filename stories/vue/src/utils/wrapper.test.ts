import { describe, expect, it } from 'vitest'
import { createI18n } from './wrapper'

describe('createI18n', () => {
	it('keeps replacements made before unmatched params', () => {
		expect(createI18n().translate('msg', {
			name: 'Mark',
			unused: 'value',
		})).toBe('Hello Mark')
	})
})
