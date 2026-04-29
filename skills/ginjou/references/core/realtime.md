# Core Realtime

## Realtime Contract

See [Realtime](https://ginjou.pages.dev/raw/guides/realtime.md) for contract walkthroughs and query-integration examples.

```ts
interface Realtime {
	subscribe: SubscribeFn<any, any>
	unsubscribe?: UnsubscribeFn
	publish?: PublishFn<any>
	options?: RealtimeContextOptions<any>
}
```

The provider only binds an already-existing transport into the shared contract. It does not create websocket, SSE, or backend event transport for you.

## Transport Boundary And Fallback

- If transport exists, subscribe through the realtime provider.
- If transport does not exist or is unconfirmed, say so explicitly.
- Choose polling, manual refresh, or a hybrid fallback instead of promising push updates.

Start with conservative polling intervals and add a visible refresh or last-updated affordance when realtime is unavailable.

## Subscription Model

```
subscribe({ channel, actions, callback, params, meta }) => string
```

The returned string key is passed back to `unsubscribe` during cleanup when an unsubscribe function exists.

`params` can model list, one-record, many-record, or custom subscription state.

## Mode Selection

- `auto` for invalidate-and-refetch behavior
- `manual` for event-specific callback behavior

Provider-level `options` only include `mode`, `callback`, and `params`. Channel selection stays on each subscription.

## `RealtimeAction`

- `RealtimeAction.Any`
- `RealtimeAction.Created`
- `RealtimeAction.Updated`
- `RealtimeAction.Deleted`

## Rules

- Require a real transport before promising realtime behavior.
- Make `subscribe` return a string key and keep `unsubscribe` compatible with that key.
- Keep provider-level options limited to mode, callback, and params.
- Treat no-transport fallback as a first-class answer, not as an afterthought.
- Choose `auto` by default and switch to `manual` only when event-specific behavior is required.
