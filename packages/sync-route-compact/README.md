# @ginjou/sync-route-compact

Compact route query codecs for Ginjou list filters and sorters.

## Installation

```bash
npm install @ginjou/sync-route-compact
```

## Usage

```ts
import { filters, sorters } from '@ginjou/sync-route-compact'

defineControllerContext({
	syncRoute: {
		filters,
		sorters,
	},
})
```

Individual `useList` and `useInfiniteList` options override the controller setting.

## License

Made with ❤️

Published under the [MIT License](https://github.com/aa900031/ginjou/blob/main/LICENSE).
