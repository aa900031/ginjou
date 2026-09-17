import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { expectUnsubscribeCalled, MockRealtimes, subscribeFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
import { defineRealtimeContext } from './context'
import { useSubscribe } from './subscribe'

const PROPS = {
	channel: 'resources/posts',
	callback: () => {},
}

describe('useSubscribe', () => {
	it('should subscribe on the client and unsubscribe on unmount', async () => {
		const { unmount } = mountTestApp(
			() => useSubscribe(PROPS),
			{ realtime: MockRealtimes },
		)

		expect(subscribeFn).toHaveBeenCalledTimes(1)

		unmount()
		expectUnsubscribeCalled()
	})

	it('should not subscribe while rendering on the server', async () => {
		vi.stubGlobal('window', undefined)

		try {
			const Comp = defineComponent({
				setup: () => {
					defineRealtimeContext(MockRealtimes)
					useSubscribe(PROPS)
					return () => h('div')
				},
			})

			await renderToString(createSSRApp(Comp))
		}
		finally {
			vi.unstubAllGlobals()
		}

		expect(subscribeFn).not.toHaveBeenCalled()
	})
})
