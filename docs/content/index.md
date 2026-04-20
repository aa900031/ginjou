---
seo:
  title: Ginjou
  description: Build data-heavy frontends on a framework-agnostic core with shared contracts for data, auth, authz, routing, i18n, notifications, realtime, and resources.
---

::u-page-hero
---
orientation: horizontal
---

#default
  :::the-logo
  :::

#title
A Headless App Framework for Data-Heavy Frontends

#description
Build on a framework-agnostic core with shared contracts, cache-aware data flows, and page-level controllers.

#links
  :::u-button
  ---
  size: xl
  to: /guides/introduction
  icon: i-lucide-arrow-right
  ---
  Get Started
  :::

  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-storybook
  size: xl
  to: https://ginjou-storybook.pages.dev
  variant: outline
  target: _blank
  class: after:content-['↗']
  rel: noreferrer noopener
  ---
  Storybook
  :::
::

::u-page-section
---
title: Features
---
#default
  :::card-group

  ::card
  ---
  title: Headless Core
  icon: i-lucide-layers-3
  to: /guides/introduction
  ---
  Start from `@ginjou/core` and keep data, auth, router, and resource contracts independent from any single framework.
  ::

  ::card
  ---
  title: Query-Driven Data Layer
  icon: i-lucide-database-zap
  to: /guides/data
  ---
  Use one shared model for lists, detail views, mutations, and custom requests on top of TanStack Query.
  ::

  ::card
  ---
  title: Route-Aware Controllers
  icon: i-lucide-route
  to: /guides/router
  ---
  Let resources, router context, and controllers work together so list, show, create, and edit flows stay aligned.
  ::

  ::card
  ---
  title: Optional App Contracts
  icon: i-lucide-plug-zap
  to: /integrations/vue
  ---
  Add auth, authz, i18n, notifications, realtime, and resources only when your app actually needs them.
  ::

  ::card
  ---
  title: Frontend Adapters
  icon: i-lucide-blocks
  to: /integrations/vue
  ---
  Use the same contracts across frontend adapters. Today's docs cover Vue and Nuxt, and the core model is built to grow into more framework integrations over time.
  ::

  ::card
  ---
  title: Backend Adapters
  icon: i-lucide-server-cog
  to: /backend/rest-api
  ---
  Connect REST-style APIs, Directus, and Supabase through adapters that preserve the same Ginjou hook surface.
  ::

  :::
::


::u-page-section
---
title: Integrations
description: Move between frontend adapters and backend bridges without rewriting your app model.
---
#default
  <div class="flex flex-col min-w-0 gap-2">

    ::u-marquee
    ---
    class: not-prose
    pauseOnHover: true
    overlay: false
    repeat: 10
    ui:
      root: "[--gap:--spacing(4)]"
      content: "w-auto py-1"
    ---
    :::u-button
    ---
    class: flex shrink-0
    label: Vue
    icon: i-logos-vue
    size: xl
    variant: outline
    color: neutral
    to: /integrations/vue
    ---
    :::
    :::u-button
    ---
    class: flex shrink-0
    label: Nuxt
    icon: i-logos-nuxt-icon
    size: xl
    variant: outline
    color: neutral
    to: /integrations/nuxt
    ---
    :::
    ::

    ::u-marquee
    ---
    class: not-prose
    pauseOnHover: true
    reverse: true
    overlay: false
    repeat: 6
    ui:
      root: "[--gap:--spacing(4)]"
      content: "w-auto py-1"
    ---
    :::u-button
    ---
    class: flex shrink-0
    label: RESTful API
    icon: i-lucide-server
    size: xl
    variant: outline
    color: neutral
    to: /backend/rest-api
    ---
    :::
    :::u-button
    ---
    class: flex shrink-0
    label: Directus
    icon: i-simple-icons-directus
    size: xl
    variant: outline
    color: neutral
    to: /backend/directus
    ---
    :::
    :::u-button
    ---
    class: flex shrink-0
    label: Supabase
    icon: i-logos-supabase-icon
    size: xl
    variant: outline
    color: neutral
    to: /backend/supabase
    ---
    :::
    ::

  </div>
::
