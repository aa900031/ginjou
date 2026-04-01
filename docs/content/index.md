---
seo:
  title: Ginjou
  description: Headless building blocks for Vue and Nuxt data applications.
---

::u-page-hero
---
orientation: horizontal
---

#default
  :::the-logo
  :::

#title
Build Data Applications Without Giving Up Control

#description
Ginjou is a headless framework for admin panels, internal tools, and data-heavy products. Keep your own UI, connect the backend you already have, and compose only the features you need.

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

#title
Features

#description
Ginjou stays focused on the parts that data-heavy applications need most.

#features
  :::u-page-feature
  ---
  icon: i-lucide-layers-3
  orientation: vertical
  ---
  #title
  Headless By Default

  #description
  Keep full control over your UI layer. Ginjou gives you data, auth, routing, and controller building blocks without forcing a component library.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-workflow
  orientation: vertical
  ---
  #title
  Composables First, Controllers When Useful

  #description
  Start with low-level queries and mutations, then adopt higher-level controllers like list, edit, and show only where they reduce page complexity.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-database-zap
  orientation: vertical
  ---
  #title
  Multi-Backend Ready

  #description
  Use one fetcher or many. Built-in providers cover common backends, and custom fetchers stay small enough to own without framework lock-in.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-shield-check
  orientation: vertical
  ---
  #title
  Add Capabilities Incrementally

  #description
  Register only what the app needs today. Fetchers, auth, notifications, realtime, and routing can be added one capability at a time.
  :::
::

::u-page-section

#title
Integrations

#description
Start with the framework integration that matches your application shell.

#default
:::card-group
---
ui: {
  base: md:grid-cols-3
}
---
  ::::card
  ---
  title: Vue
  icon: i-logos-vue
  to: /integrations/vue
  ---
  ::::
  ::::card
  ---
  title: Nuxt
  icon: i-logos-nuxt-icon
  to: /integrations/nuxt
  ---
  ::::
:::
::

::u-page-section

#title
Backends

#description
Choose a backend provider when the existing API shape is already close, or use it as a reference for your own fetcher.

#default
:::card-group
---
ui: {
  base: md:grid-cols-3
}
---
  ::::card
  ---
  title: RESTful API
  icon: i-lucide-waypoints
  to: /backend/rest-api
  ---
  ::::
  ::::card
  ---
  title: Directus
  icon: i-simple-icons-directus
  to: /backend/directus
  ui: {
    icon: 'text-[#6F4EFF]',
  }
  ---
  ::::
  ::::card
  ---
  title: Supabase
  icon: i-logos-supabase-icon
  to: /backend/supabase
  ---
  ::::
:::
::
