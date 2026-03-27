# Dashboard Example Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Nuxt dashboard example under `examples/dashboard` that reuses the Nuxt UI dashboard shell while demonstrating a real Ginjou Orders flow backed by a mock REST API.

**Architecture:** Add `examples/dashboard` as a workspace package, keep the dashboard shell inside Nuxt app files, and keep order querying logic in pure shared helpers so it can be tested independently from Nitro handlers. Wire the app root with `@ginjou/nuxt`, `@tanstack/vue-query`, and `@ginjou/with-rest-api`; then use `useAsyncGetList` for Home widgets and `useAsyncList`, `useAsyncShow`, and `useAsyncEdit` for the Orders pages.

**Tech Stack:** Nuxt 4, @nuxt/ui, @ginjou/nuxt, @ginjou/with-rest-api, @tanstack/vue-query, Vitest, zod, date-fns

---

## File Map

- Modify: `pnpm-workspace.yaml` — add `examples/*` so pnpm recognizes the dashboard app.
- Modify: `package.json` — add a root convenience script for local dashboard development.
- Modify: `examples/dashboard/package.json` — define the example package manifest and scripts.
- Create: `examples/dashboard/nuxt.config.ts` — register Nuxt modules and CSS.
- Create: `examples/dashboard/tsconfig.json` — extend Nuxt generated types.
- Create: `examples/dashboard/app/app.vue` — register Ginjou providers and root shell.
- Create: `examples/dashboard/app/app.config.ts` — define Nuxt UI color tokens.
- Create: `examples/dashboard/app/assets/css/main.css` — import Tailwind and Nuxt UI theme layers.
- Create: `examples/dashboard/app/composables/useDashboard.ts` — hold sidebar state and keyboard shortcuts.
- Create: `examples/dashboard/app/layouts/default.vue` — dashboard layout and navigation.
- Create: `examples/dashboard/app/pages/index.vue` — Home page using lower-level Ginjou queries.
- Create: `examples/dashboard/app/pages/orders/index.vue` — Ginjou list controller page.
- Create: `examples/dashboard/app/pages/orders/[id].vue` — Ginjou show controller page.
- Create: `examples/dashboard/app/pages/orders/[id]/edit.vue` — Ginjou edit controller page.
- Create: `examples/dashboard/app/pages/settings.vue` — lightweight settings shell.
- Create: `examples/dashboard/app/components/home/StatsGrid.vue` — summary card UI.
- Create: `examples/dashboard/app/components/orders/OrdersTable.vue` — reusable orders table UI.
- Create: `examples/dashboard/app/components/orders/OrderStatusBadge.vue` — order status badge renderer.
- Create: `examples/dashboard/app/components/orders/PaymentStatusBadge.vue` — payment status badge renderer.
- Create: `examples/dashboard/shared/orders.ts` — types, seed data, pure filtering/sorting/pagination helpers, and stat derivation.
- Create: `examples/dashboard/server/utils/orders-store.ts` — in-memory order store over the shared seed data.
- Create: `examples/dashboard/server/api/orders/index.get.ts` — list endpoint with json-server style params and `x-total-count`.
- Create: `examples/dashboard/server/api/orders/[id].get.ts` — single-order endpoint.
- Create: `examples/dashboard/server/api/orders/[id].patch.ts` — editable field update endpoint.
- Create: `examples/dashboard/test/orders.test.ts` — focused tests for query logic and stat derivation.

### Task 1: Register the workspace package and scaffold the Nuxt app

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json`
- Modify: `examples/dashboard/package.json`
- Create: `examples/dashboard/nuxt.config.ts`
- Create: `examples/dashboard/tsconfig.json`
- Create: `examples/dashboard/app/app.config.ts`
- Create: `examples/dashboard/app/assets/css/main.css`

- [ ] **Step 1: Add the dashboard app to the workspace and root scripts**

```yaml
# pnpm-workspace.yaml
packages:
  - docs
  - examples/*
  - packages/*
  - internals/*
  - stories/*
  - packages/nuxt/playground
```

```json
// package.json
{
  "scripts": {
    "dev:dashboard": "turbo run dev --filter=@ginjou/example-dashboard"
  }
}
```

- [ ] **Step 2: Define the example package manifest**

```json
{
  "name": "@ginjou/example-dashboard",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "test": "vitest run",
    "typecheck": "nuxt typecheck"
  },
  "dependencies": {
    "@ginjou/nuxt": "workspace:^",
    "@ginjou/with-rest-api": "workspace:^",
    "@iconify-json/lucide": "^1.2.98",
    "@nuxt/ui": "^4.5.1",
    "@tanstack/vue-query": "^5.92.9",
    "date-fns": "^4.1.0",
    "nuxt": "^4.4.2",
    "tailwindcss": "^4.2.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@nuxt/eslint": "^1.15.2",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 3: Create the Nuxt configuration and theme entrypoints**

```ts
// examples/dashboard/nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@ginjou/nuxt'
  ],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-07-11'
})
```

```json
// examples/dashboard/tsconfig.json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

```ts
// examples/dashboard/app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc'
    }
  }
})
```

```css
/* examples/dashboard/app/assets/css/main.css */
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

@theme static {
  --font-sans: 'Public Sans', sans-serif;
}
```

- [ ] **Step 4: Install dependencies and verify Nuxt prepares cleanly**

Run: `cd /Users/zhong666/Developer/ginjou && pnpm install`

Expected: `pnpm` finishes and includes `examples/dashboard` in the workspace installation output.

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard exec nuxt prepare`

Expected: Nuxt generates `.nuxt` without module resolution errors.

- [ ] **Step 5: Commit the scaffold**

```bash
git add pnpm-workspace.yaml package.json examples/dashboard/package.json examples/dashboard/nuxt.config.ts examples/dashboard/tsconfig.json examples/dashboard/app/app.config.ts examples/dashboard/app/assets/css/main.css
git commit -m "feat: scaffold dashboard example app"
```

### Task 2: Add the pure Orders domain module and its first tests

**Files:**
- Create: `examples/dashboard/shared/orders.ts`
- Create: `examples/dashboard/test/orders.test.ts`

- [ ] **Step 1: Write the failing tests for list behavior and summary stats**

```ts
// examples/dashboard/test/orders.test.ts
import { describe, expect, it } from 'vitest'
import { buildOrderStats, listOrders, seedOrders } from '../shared/orders'

describe('listOrders', () => {
  it('applies search, descending amount sort, and pagination together', () => {
    const result = listOrders(seedOrders, {
      q: 'olivia',
      sort: 'amount',
      order: 'desc',
      start: 0,
      end: 1
    })

    expect(result.total).toBe(2)
    expect(result.data).toHaveLength(1)
    expect(result.data[0]?.customerName).toBe('Olivia Martin')
  })
})

describe('buildOrderStats', () => {
  it('counts revenue, total orders, paid orders, and pending pipeline orders', () => {
    const stats = buildOrderStats(seedOrders)

    expect(stats.revenue).toBe(3470)
    expect(stats.orders).toBe(6)
    expect(stats.paidOrders).toBe(3)
    expect(stats.pendingOrders).toBe(2)
  })
})
```

- [ ] **Step 2: Run the tests to confirm the module does not exist yet**

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard test -- test/orders.test.ts`

Expected: FAIL with a module resolution error for `../shared/orders`.

- [ ] **Step 3: Implement the shared order model and pure query helpers**

```ts
// examples/dashboard/shared/orders.ts
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'
export type OrderChannel = 'web' | 'mobile' | 'store' | 'marketplace'

export interface Order {
  id: number
  number: string
  customerName: string
  customerEmail: string
  amount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  channel: OrderChannel
  createdAt: string
  updatedAt: string
}

export interface ListOrdersInput {
  start?: number
  end?: number
  sort?: keyof Order
  order?: 'asc' | 'desc'
  q?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
}

export interface OrderStats {
  revenue: number
  orders: number
  paidOrders: number
  pendingOrders: number
}

export const seedOrders: Order[] = [
  {
    id: 1,
    number: 'ORD-1001',
    customerName: 'Olivia Martin',
    customerEmail: 'olivia.martin@example.com',
    amount: 1240,
    status: 'processing',
    paymentStatus: 'paid',
    channel: 'web',
    createdAt: '2026-03-25T09:30:00.000Z',
    updatedAt: '2026-03-25T09:30:00.000Z'
  },
  {
    id: 2,
    number: 'ORD-1002',
    customerName: 'Marcus Lee',
    customerEmail: 'marcus.lee@example.com',
    amount: 860,
    status: 'pending',
    paymentStatus: 'pending',
    channel: 'mobile',
    createdAt: '2026-03-24T14:10:00.000Z',
    updatedAt: '2026-03-24T14:10:00.000Z'
  },
  {
    id: 3,
    number: 'ORD-1003',
    customerName: 'Ava Thompson',
    customerEmail: 'ava.thompson@example.com',
    amount: 930,
    status: 'delivered',
    paymentStatus: 'paid',
    channel: 'store',
    createdAt: '2026-03-23T08:15:00.000Z',
    updatedAt: '2026-03-23T08:15:00.000Z'
  },
  {
    id: 4,
    number: 'ORD-1004',
    customerName: 'Noah Patel',
    customerEmail: 'noah.patel@example.com',
    amount: 440,
    status: 'cancelled',
    paymentStatus: 'refunded',
    channel: 'marketplace',
    createdAt: '2026-03-22T17:45:00.000Z',
    updatedAt: '2026-03-23T12:00:00.000Z'
  },
  {
    id: 5,
    number: 'ORD-1005',
    customerName: 'Olivia Stone',
    customerEmail: 'olivia.stone@example.com',
    amount: 1300,
    status: 'delivered',
    paymentStatus: 'paid',
    channel: 'web',
    createdAt: '2026-03-21T11:20:00.000Z',
    updatedAt: '2026-03-21T11:20:00.000Z'
  },
  {
    id: 6,
    number: 'ORD-1006',
    customerName: 'Sophia Rivera',
    customerEmail: 'sophia.rivera@example.com',
    amount: 520,
    status: 'pending',
    paymentStatus: 'failed',
    channel: 'mobile',
    createdAt: '2026-03-20T16:05:00.000Z',
    updatedAt: '2026-03-20T16:05:00.000Z'
  }
]

export function listOrders(orders: Order[], input: ListOrdersInput = {}) {
  let rows = [...orders]

  if (input.q) {
    const keyword = input.q.toLowerCase()
    rows = rows.filter(order => {
      return [order.number, order.customerName, order.customerEmail, order.channel]
        .some(value => value.toLowerCase().includes(keyword))
    })
  }

  if (input.status) {
    rows = rows.filter(order => order.status === input.status)
  }

  if (input.paymentStatus) {
    rows = rows.filter(order => order.paymentStatus === input.paymentStatus)
  }

  if (input.sort) {
    rows.sort((left, right) => {
      const leftValue = left[input.sort!]
      const rightValue = right[input.sort!]

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return input.order === 'desc' ? rightValue - leftValue : leftValue - rightValue
      }

      return input.order === 'desc'
        ? String(rightValue).localeCompare(String(leftValue))
        : String(leftValue).localeCompare(String(rightValue))
    })
  }

  const total = rows.length
  const start = Math.max(input.start ?? 0, 0)
  const end = Math.max(input.end ?? total, start)

  return {
    data: rows.slice(start, end),
    total
  }
}

export function buildOrderStats(orders: Order[]): OrderStats {
  return {
    revenue: orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.amount, 0),
    orders: orders.length,
    paidOrders: orders.filter(order => order.paymentStatus === 'paid').length,
    pendingOrders: orders.filter(order => ['pending', 'processing'].includes(order.status)).length
  }
}
```

- [ ] **Step 4: Run the tests again and confirm they pass**

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard test -- test/orders.test.ts`

Expected: PASS with 2 passing tests.

- [ ] **Step 5: Commit the domain helpers**

```bash
git add examples/dashboard/shared/orders.ts examples/dashboard/test/orders.test.ts
git commit -m "feat: add dashboard order domain helpers"
```

### Task 3: Implement the mock REST API over the tested order helpers

**Files:**
- Create: `examples/dashboard/server/utils/orders-store.ts`
- Create: `examples/dashboard/server/api/orders/index.get.ts`
- Create: `examples/dashboard/server/api/orders/[id].get.ts`
- Create: `examples/dashboard/server/api/orders/[id].patch.ts`

- [ ] **Step 1: Add the in-memory store wrapper used by Nitro handlers**

```ts
// examples/dashboard/server/utils/orders-store.ts
import type { Order, OrderChannel, OrderStatus, PaymentStatus } from '../../shared/orders'
import { listOrders, seedOrders } from '../../shared/orders'

const ordersState: Order[] = structuredClone(seedOrders)

export function queryOrders(query: Record<string, string | string[] | undefined>) {
  const start = Number.parseInt(String(query._start ?? '0'), 10)
  const end = Number.parseInt(String(query._end ?? ordersState.length), 10)
  const sort = typeof query._sort === 'string' ? query._sort as keyof Order : undefined
  const order = query._order === 'desc' ? 'desc' : 'asc'
  const q = typeof query.q === 'string' ? query.q : undefined
  const status = typeof query.status === 'string' ? query.status as OrderStatus : undefined
  const paymentStatus = typeof query.paymentStatus === 'string' ? query.paymentStatus as PaymentStatus : undefined

  return listOrders(ordersState, {
    start,
    end,
    sort,
    order,
    q,
    status,
    paymentStatus
  })
}

export function getOrderById(id: number) {
  return ordersState.find(order => order.id === id)
}

export function patchOrder(id: number, payload: Partial<Pick<Order, 'status' | 'paymentStatus' | 'channel'>>) {
  const order = getOrderById(id)

  if (!order) {
    return undefined
  }

  if (payload.status) {
    order.status = payload.status
  }

  if (payload.paymentStatus) {
    order.paymentStatus = payload.paymentStatus
  }

  if (payload.channel) {
    order.channel = payload.channel as OrderChannel
  }

  order.updatedAt = new Date().toISOString()
  return order
}
```

- [ ] **Step 2: Create the list, show, and patch handlers**

```ts
// examples/dashboard/server/api/orders/index.get.ts
import { getQuery, setHeader } from 'h3'
import { queryOrders } from '../../utils/orders-store'

export default defineEventHandler((event) => {
  const result = queryOrders(getQuery(event))

  setHeader(event, 'x-total-count', String(result.total))
  return result.data
})
```

```ts
// examples/dashboard/server/api/orders/[id].get.ts
import { createError, getRouterParam } from 'h3'
import { getOrderById } from '../../utils/orders-store'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const order = getOrderById(id)

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  return order
})
```

```ts
// examples/dashboard/server/api/orders/[id].patch.ts
import { createError, getRouterParam, readBody } from 'h3'
import type { Order } from '../../../shared/orders'
import { patchOrder } from '../../utils/orders-store'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const payload = await readBody<Partial<Pick<Order, 'status' | 'paymentStatus' | 'channel'>>>(event)
  const order = patchOrder(id, payload)

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  return order
})
```

- [ ] **Step 3: Run the existing tests and a typecheck smoke check**

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard test -- test/orders.test.ts`

Expected: PASS with the same 2 tests.

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard typecheck`

Expected: PASS or only route files missing app shell imports that will be added in the next task.

- [ ] **Step 4: Commit the mock API**

```bash
git add examples/dashboard/server/utils/orders-store.ts examples/dashboard/server/api/orders
git commit -m "feat: add dashboard orders mock api"
```

### Task 4: Wire Ginjou at the app root and add the dashboard shell

**Files:**
- Create: `examples/dashboard/app/app.vue`
- Create: `examples/dashboard/app/composables/useDashboard.ts`
- Create: `examples/dashboard/app/layouts/default.vue`

- [ ] **Step 1: Create the root app file with Ginjou providers**

```vue
<!-- examples/dashboard/app/app.vue -->
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext } from '@ginjou/vue'
import { QueryClient } from '@tanstack/vue-query'
import { createFetcher } from '@ginjou/with-rest-api'

defineQueryClientContext(new QueryClient())

defineFetchersContext({
  default: createFetcher({
    url: '/api'
  })
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

- [ ] **Step 2: Add sidebar state and keyboard shortcuts**

```ts
// examples/dashboard/app/composables/useDashboard.ts
export function useDashboard() {
  const open = useState('dashboard-sidebar-open', () => true)
  const router = useRouter()

  defineShortcuts({
    'g-h': () => router.push('/'),
    'g-o': () => router.push('/orders'),
    'g-s': () => router.push('/settings')
  })

  return {
    open
  }
}
```

- [ ] **Step 3: Add the default dashboard layout**

```vue
<!-- examples/dashboard/app/layouts/default.vue -->
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { open } = useDashboard()

const links = computed<NavigationMenuItem[][]>(() => [[
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/'
  },
  {
    label: 'Orders',
    icon: 'i-lucide-shopping-cart',
    to: '/orders'
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/settings'
  }
], [
  {
    label: route.path === '/orders' ? 'Orders active' : 'Dashboard example',
    icon: 'i-lucide-badge-info'
  }
]])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #header>
        <div class="px-2">
          <p class="text-sm font-semibold text-highlighted">
            Ginjou Dashboard
          </p>
          <p class="text-xs text-muted">
            Orders example
          </p>
        </div>
      </template>

      <template #default>
        <UNavigationMenu :items="links[0]" orientation="vertical" tooltip />
        <UNavigationMenu :items="links[1]" orientation="vertical" class="mt-auto" tooltip />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
```

- [ ] **Step 4: Run Nuxt typecheck to catch root wiring issues early**

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard typecheck`

Expected: PASS or only page/component missing-file errors that are resolved in the next tasks.

- [ ] **Step 5: Commit the app shell**

```bash
git add examples/dashboard/app/app.vue examples/dashboard/app/composables/useDashboard.ts examples/dashboard/app/layouts/default.vue
git commit -m "feat: add dashboard app shell"
```

### Task 5: Build the Home page and Orders list page

**Files:**
- Create: `examples/dashboard/app/components/home/StatsGrid.vue`
- Create: `examples/dashboard/app/components/orders/OrderStatusBadge.vue`
- Create: `examples/dashboard/app/components/orders/PaymentStatusBadge.vue`
- Create: `examples/dashboard/app/components/orders/OrdersTable.vue`
- Create: `examples/dashboard/app/pages/index.vue`
- Create: `examples/dashboard/app/pages/orders/index.vue`

- [ ] **Step 1: Add the small reusable UI components**

```vue
<!-- examples/dashboard/app/components/home/StatsGrid.vue -->
<script setup lang="ts">
defineProps<{
  stats: {
    revenue: number
    orders: number
    paidOrders: number
    pendingOrders: number
  }
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard>
      <p class="text-sm text-muted">Revenue</p>
      <p class="mt-2 text-2xl font-semibold text-highlighted">${{ stats.revenue }}</p>
    </UCard>
    <UCard>
      <p class="text-sm text-muted">Orders</p>
      <p class="mt-2 text-2xl font-semibold text-highlighted">{{ stats.orders }}</p>
    </UCard>
    <UCard>
      <p class="text-sm text-muted">Paid orders</p>
      <p class="mt-2 text-2xl font-semibold text-highlighted">{{ stats.paidOrders }}</p>
    </UCard>
    <UCard>
      <p class="text-sm text-muted">Pending pipeline</p>
      <p class="mt-2 text-2xl font-semibold text-highlighted">{{ stats.pendingOrders }}</p>
    </UCard>
  </div>
</template>
```

```vue
<!-- examples/dashboard/app/components/orders/OrderStatusBadge.vue -->
<script setup lang="ts">
import type { OrderStatus } from '../../../shared/orders'

const props = defineProps<{
  status: OrderStatus
}>()

const color = computed(() => ({
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error'
}[props.status] as 'warning' | 'info' | 'primary' | 'success' | 'error'))
</script>

<template>
  <UBadge :color="color" variant="subtle">
    {{ status }}
  </UBadge>
</template>
```

```vue
<!-- examples/dashboard/app/components/orders/PaymentStatusBadge.vue -->
<script setup lang="ts">
import type { PaymentStatus } from '../../../shared/orders'

const props = defineProps<{
  status: PaymentStatus
}>()

const color = computed(() => ({
  paid: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'neutral'
}[props.status] as 'success' | 'warning' | 'error' | 'neutral'))
</script>

<template>
  <UBadge :color="color" variant="subtle">
    {{ status }}
  </UBadge>
</template>
```

```vue
<!-- examples/dashboard/app/components/orders/OrdersTable.vue -->
<script setup lang="ts">
import type { Order } from '../../../shared/orders'

defineProps<{
  orders: Order[]
}>()
</script>

<template>
  <UTable :data="orders">
    <template #number-cell="{ row }">
      <NuxtLink :to="`/orders/${row.original.id}`" class="font-medium text-highlighted hover:underline">
        {{ row.original.number }}
      </NuxtLink>
    </template>

    <template #status-cell="{ row }">
      <OrderStatusBadge :status="row.original.status" />
    </template>

    <template #paymentStatus-cell="{ row }">
      <PaymentStatusBadge :status="row.original.paymentStatus" />
    </template>
  </UTable>
</template>
```

- [ ] **Step 2: Create the Home page with lower-level Ginjou queries**

```vue
<!-- examples/dashboard/app/pages/index.vue -->
<script setup lang="ts">
import { SortOrder } from '@ginjou/core'
import { buildOrderStats, type Order } from '../../shared/orders'

const { records: summaryOrders } = await useAsyncGetList<Order>({
  resource: 'orders',
  pagination: {
    current: 1,
    perPage: 100
  }
})

const { records: recentOrders } = await useAsyncGetList<Order>({
  resource: 'orders',
  pagination: {
    current: 1,
    perPage: 5
  },
  sorters: [{
    field: 'createdAt',
    order: SortOrder.Desc
  }]
})

const stats = computed(() => buildOrderStats(summaryOrders.value ?? []))
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton to="/orders" label="View orders" icon="i-lucide-arrow-right" color="neutral" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-6">
        <StatsGrid :stats="stats" />

        <UCard>
          <template #header>
            <div>
              <p class="text-base font-semibold text-highlighted">Recent orders</p>
              <p class="text-sm text-muted">Latest records fetched through Ginjou.</p>
            </div>
          </template>

          <OrdersTable :orders="recentOrders ?? []" />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
```

- [ ] **Step 3: Create the Orders list page with `useAsyncList`**

```vue
<!-- examples/dashboard/app/pages/orders/index.vue -->
<script setup lang="ts">
import { FilterOperator, SortOrder } from '@ginjou/core'
import type { Order } from '../../../shared/orders'

const search = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined

const {
  records,
  currentPage,
  perPage,
  pageCount,
  sorters,
  setSorters,
  setFilters,
  isLoading
} = await useAsyncList<Order>({
  resource: 'orders',
  syncRoute: true,
  pagination: {
    initialPage: 1,
    perPage: 5
  },
  sorters: {
    initial: [{
      field: 'createdAt',
      order: SortOrder.Desc
    }]
  }
})

watch(search, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    setFilters(value
      ? [{ field: 'q', operator: FilterOperator.contains, value }]
      : [])
  }, 300)
})

function toggleSort(field: keyof Order) {
  const current = sorters.value[0]
  const nextOrder = current?.field === field && current.order === SortOrder.Desc
    ? SortOrder.Asc
    : SortOrder.Desc

  setSorters([{ field, order: nextOrder }])
}
</script>

<template>
  <UDashboardPanel id="orders">
    <template #header>
      <UDashboardNavbar title="Orders">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search orders" class="md:max-w-sm" />

          <div class="flex items-center gap-2">
            <UButton color="neutral" variant="subtle" label="Sort by amount" @click="toggleSort('amount')" />
            <UButton color="neutral" variant="subtle" label="Sort by date" @click="toggleSort('createdAt')" />
          </div>
        </div>

        <UCard>
          <OrdersTable :orders="records ?? []" />
        </UCard>

        <div class="flex items-center justify-between">
          <p class="text-sm text-muted">
            Page {{ currentPage }} of {{ pageCount ?? 1 }}
          </p>
          <UPagination v-model:page="currentPage" :items-per-page="perPage" :total="(pageCount ?? 1) * perPage" />
        </div>

        <UAlert v-if="isLoading" color="neutral" variant="subtle" title="Loading orders" />
      </div>
    </template>
  </UDashboardPanel>
</template>
```

- [ ] **Step 4: Verify typecheck passes with the first user-facing pages in place**

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard typecheck`

Expected: PASS, or only missing show/edit/settings route errors that will be resolved in the next task.

- [ ] **Step 5: Commit the Home and Orders list pages**

```bash
git add examples/dashboard/app/components/home/StatsGrid.vue examples/dashboard/app/components/orders examples/dashboard/app/pages/index.vue examples/dashboard/app/pages/orders/index.vue
git commit -m "feat: add dashboard home and orders list"
```

### Task 6: Build the Order detail page, edit page, and settings shell

**Files:**
- Create: `examples/dashboard/app/pages/orders/[id].vue`
- Create: `examples/dashboard/app/pages/orders/[id]/edit.vue`
- Create: `examples/dashboard/app/pages/settings.vue`

- [ ] **Step 1: Add the Order detail page with `useAsyncShow`**

```vue
<!-- examples/dashboard/app/pages/orders/[id].vue -->
<script setup lang="ts">
import type { Order } from '../../../shared/orders'

const route = useRoute()

const { record, isLoading } = await useAsyncShow<Order>({
  resource: 'orders',
  id: computed(() => String(route.params.id))
})
</script>

<template>
  <UDashboardPanel id="order-show">
    <template #header>
      <UDashboardNavbar :title="record?.number ?? 'Order'">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton :to="`/orders/${route.params.id}/edit`" label="Edit order" color="neutral" icon="i-lucide-pencil" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UAlert v-if="isLoading" color="neutral" variant="subtle" title="Loading order" />

      <div v-else-if="record" class="grid gap-4 lg:grid-cols-2">
        <UCard>
          <template #header>
            <p class="font-semibold text-highlighted">Order summary</p>
          </template>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-muted">Order number</dt><dd>{{ record.number }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-muted">Amount</dt><dd>${{ record.amount }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-muted">Channel</dt><dd>{{ record.channel }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-muted">Created</dt><dd>{{ record.createdAt }}</dd></div>
          </dl>
        </UCard>

        <UCard>
          <template #header>
            <p class="font-semibold text-highlighted">Customer</p>
          </template>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-4"><dt class="text-muted">Name</dt><dd>{{ record.customerName }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-muted">Email</dt><dd>{{ record.customerEmail }}</dd></div>
            <div class="flex justify-between gap-4"><dt class="text-muted">Status</dt><dd><OrderStatusBadge :status="record.status" /></dd></div>
            <div class="flex justify-between gap-4"><dt class="text-muted">Payment</dt><dd><PaymentStatusBadge :status="record.paymentStatus" /></dd></div>
          </dl>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
```

- [ ] **Step 2: Add the Order edit page with `useAsyncEdit` and a focused form**

```vue
<!-- examples/dashboard/app/pages/orders/[id]/edit.vue -->
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Order } from '../../../../shared/orders'

const route = useRoute()

const schema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  paymentStatus: z.enum(['paid', 'pending', 'failed', 'refunded']),
  channel: z.enum(['web', 'mobile', 'store', 'marketplace'])
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  status: 'pending',
  paymentStatus: 'pending',
  channel: 'web'
})

const { record, save, isLoading } = await useAsyncEdit<Order, Partial<Schema>>({
  resource: 'orders',
  id: computed(() => String(route.params.id)),
  mutationMode: 'pessimistic'
})

watch(record, (value) => {
  if (!value) {
    return
  }

  state.status = value.status
  state.paymentStatus = value.paymentStatus
  state.channel = value.channel
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await save(event.data)
  await navigateTo(`/orders/${route.params.id}`)
}
</script>

<template>
  <UDashboardPanel id="order-edit">
    <template #header>
      <UDashboardNavbar title="Edit order">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Status" name="status">
            <USelect v-model="state.status" :items="['pending', 'processing', 'shipped', 'delivered', 'cancelled']" />
          </UFormField>

          <UFormField label="Payment status" name="paymentStatus">
            <USelect v-model="state.paymentStatus" :items="['paid', 'pending', 'failed', 'refunded']" />
          </UFormField>

          <UFormField label="Channel" name="channel">
            <USelect v-model="state.channel" :items="['web', 'mobile', 'store', 'marketplace']" />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton :to="`/orders/${route.params.id}`" color="neutral" variant="subtle" label="Cancel" />
            <UButton type="submit" color="neutral" :loading="isLoading" label="Save changes" />
          </div>
        </UForm>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
```

- [ ] **Step 3: Add the lightweight settings shell**

```vue
<!-- examples/dashboard/app/pages/settings.vue -->
<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <div>
            <p class="font-semibold text-highlighted">Example settings</p>
            <p class="text-sm text-muted">This page stays intentionally light in v1 so Orders remains the only fully wired resource.</p>
          </div>
        </template>

        <div class="space-y-3 text-sm text-muted">
          <p>Use this shell to keep the dashboard navigation realistic.</p>
          <p>Later iterations can add profile, notification, or team settings if the example grows into a multi-resource app.</p>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
```

- [ ] **Step 4: Run full example verification before finalizing**

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard test`

Expected: PASS with the order helper tests.

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard typecheck`

Expected: PASS with no missing route or controller type errors.

Run: `cd /Users/zhong666/Developer/ginjou && pnpm --filter @ginjou/example-dashboard dev`

Expected: Nuxt dev server starts successfully.

Manual checks:

- open `/` and confirm the summary cards and recent orders render
- open `/orders` and confirm search, sort buttons, and pagination work
- open `/orders/1` and confirm order details render
- open `/orders/1/edit` and confirm saving redirects back to the detail page
- open `/settings` and confirm the shell page renders within the dashboard layout

- [ ] **Step 5: Commit the remaining routes**

```bash
git add examples/dashboard/app/pages/orders/[id].vue examples/dashboard/app/pages/orders/[id]/edit.vue examples/dashboard/app/pages/settings.vue
git commit -m "feat: complete dashboard orders flow"
```

## Self-Review

### Spec coverage

- standalone Nuxt app under `examples/dashboard`: covered in Task 1
- Nuxt UI dashboard shell: covered in Task 4
- Ginjou root wiring for Nuxt: covered in Task 4
- mock REST API using `@ginjou/with-rest-api` conventions: covered in Tasks 2 and 3
- Home page with order-driven widgets: covered in Task 5
- Orders list, show, and edit: covered in Tasks 5 and 6
- lightweight Settings shell: covered in Task 6
- focused test coverage: covered in Task 2 and verified again in Task 6

### Placeholder scan

- No `TODO`, `TBD`, or "similar to previous task" placeholders remain.
- Every code-writing step includes concrete file contents or a concrete code block.
- Every verification step includes exact commands and expected outcomes.

### Type consistency

- `Order`, `OrderStatus`, `PaymentStatus`, and `OrderChannel` are defined once in `shared/orders.ts` and reused everywhere else.
- The list API uses `_start`, `_end`, `_sort`, `_order`, and `q`, matching the REST provider contract.
- The edit page only mutates `status`, `paymentStatus`, and `channel`, matching the server patch handler.
