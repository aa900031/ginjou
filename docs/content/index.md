---
seo:
  title: Build Data-Driven Apps with Ease
  description: Ginjou organizes common data-driven workflows into a flexible core that's easy to start with and adapt as your app grows.
---

<!-- eslint-disable markdown/no-missing-atx-heading-space -->

::u-page-hero
---
orientation: horizontal
---

#default
  :::the-logo
  :::

#title
Build Data-Driven Apps with Ease

#description
Common data-driven workflows are already organized in a flexible core that's easy to start with and adapt as your app grows.

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
  ---
  Keep data, auth, router, and resources outside any single framework.
  ::

  ::card
  ---
  title: Query-Driven Data Layer
  icon: i-lucide-database-zap
  ---
  Run lists, detail views, mutations, and custom requests on one TanStack Query model.
  ::

  ::card
  ---
  title: Controller-Driven Pages
  icon: i-lucide-route
  ---
  Keep routes, resource state, and page actions aligned across every CRUD screen.
  ::

  ::card
  ---
  title: Human + AI Workflows
  icon: i-lucide-bot
  ---
  Give users and AI one skill-guided playbook for CRUD and admin workflows.
  ::

  ::card
  ---
  title: Frontend Adapters
  icon: i-lucide-blocks
  ---
  Reuse the same contracts across frontend adapters as the ecosystem grows.
  ::

  ::card
  ---
  title: Backend Adapters
  icon: i-lucide-server-cog
  ---
  Connect different backends through one app model.
  ::

  :::
::

::u-page-section
---
title: Integrations
description: Move between frontend adapters and backend adapters without rewriting your app model.
---
#default
  <div class="flex flex-col min-w-0 gap-2">

    ::u-marquee
    ---
    class: not-prose
    pauseOnHover: true
    overlay: false
    repeat: 6
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
    :::u-button
    ---
    class: flex shrink-0
    label: Svelte
    icon: i-logos-svelte-icon
    size: xl
    variant: outline
    color: neutral
    to: /integrations/svelte
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
