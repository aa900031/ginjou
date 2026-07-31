import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createI18n } from './i18n'

const mocks = vi.hoisted(() => ({
	locale: { value: 'en' },
	stop: vi.fn(),
	t: vi.fn(),
	watch: vi.fn(),
}))

vi.mock('vue-i18n', () => ({
	useI18n: () => ({
		locale: mocks.locale,
		t: mocks.t,
	}),
}))

vi.mock('vue-demi', () => ({
	unref: (value: { value: unknown }) => value.value,
	watch: mocks.watch,
}))

describe('createI18n', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mocks.locale.value = 'en'
		mocks.t.mockReturnValue('Hello')
		mocks.watch.mockReturnValue(mocks.stop)
	})

	it('maps translation and locale changes', () => {
		const i18n = createI18n()

		expect(i18n.translate('hello', { name: 'Ginjou' })).toBe('Hello')
		expect(mocks.t).toHaveBeenCalledWith('hello', { name: 'Ginjou' })
		expect(i18n.getLocale()).toBe('en')

		i18n.setLocale('zh-TW')
		expect(mocks.locale.value).toBe('zh-TW')
		expect(i18n.onChangeLocale(vi.fn())).toBe(mocks.stop)
	})
})
