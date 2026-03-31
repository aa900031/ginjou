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
  to: /guides
  icon: i-lucide-arrow-right
  ---
  Browse the guides
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
Choose Your Starting Path

#description
If you already know what you need, start from the path that matches the job.

#features
  :::u-page-feature
  ---
  title: I am wiring a first CRUD app
  icon: i-lucide-rocket
  to: /guides
  ---
  Start with the mental model, then move through data, forms, and list controllers in order.
  :::

  :::u-page-feature
  ---
  title: I need auth and access control
  icon: i-lucide-key-round
  to: /guides/authentication
  ---
  Go straight to authentication, then continue with authorization to control pages, buttons, and menus.
  :::

  :::u-page-feature
  ---
  title: I need to connect a backend
  icon: i-lucide-plug-zap
  to: /backend/rest-api
  ---
  Start with a built-in provider, then switch to the custom fetcher guide if your API contract needs translation.
  :::

  :::u-page-feature
  ---
  title: I need route-aware page logic
  icon: i-lucide-route
  to: /guides/resources
  ---
  Read resources, then use list, edit, and show controllers on top of that route model.
  :::
::

::u-page-section

#features
  :::u-page-feature
  ---
  icon: i-lucide-layers-3
  orientation: vertical
  ---
  #title
  Start With Composables, Add Controllers Later

  #description
  Build directly with low-level queries and mutations, or adopt higher-level controllers like list, edit, and show when they save time.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-database-zap
  orientation: vertical
  ---
  #title
  Use Any Backend

  #description
  Register one or many fetchers. Ginjou ships providers for REST APIs, Supabase, and Directus, and the fetcher contract is small enough to implement yourself.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-shield-check
  orientation: vertical
  ---
  #title
  Add Auth, Realtime, and Routing Incrementally

  #description
  Context-based setup keeps each capability explicit. Register only what your app needs, then expand without rewriting the foundation.
  :::
::

::u-page-section

#title
Learn Ginjou In Three Steps

#description
The documentation follows the same progression as the codebase: understand the model, wire the framework into your app, then choose or build a backend provider.

#features
  :::u-page-feature
  ---
  title: Guides
  icon: i-lucide-book-open
  to: /guides
  ---
  Start with the core mental model, then move into data, controllers, auth, authorization, notifications, realtime, and resources.
  :::

  :::u-page-feature
  ---
  title: Integrations
  icon: i-lucide-blocks
  to: /integrations
  ---
  See how Ginjou is wired into Vue and Nuxt, including root-level context registration and Nuxt SSR helpers.
  :::

  :::u-page-feature
  ---
  title: Backend
  icon: i-lucide-server
  to: /backend
  ---
  Use the built-in providers for REST APIs, Supabase, and Directus, or write a custom fetcher when your API shape does not match the defaults.
  :::
::

::u-page-section

#title
Core Guides At A Glance

#description
The guides are ordered to match the way most applications are built.

#features
  :::u-page-feature
  ---
  title: Introduction and Mental Model
  icon: i-lucide-compass
  to: /guides/introduction
  ---
  Learn how providers, composables, controllers, and resources fit together.
  :::

  :::u-page-feature
  ---
  title: Data Queries and Mutations
  icon: i-lucide-database
  to: /guides/data
  ---
  Work directly with fetchers, queries, mutations, meta, and custom backend requests.
  :::

  :::u-page-feature
  ---
  title: Create, Edit, and Show
  icon: i-lucide-square-pen
  to: /guides/form
  ---
  Use page controllers for common CRUD flows, then drop to low-level composables when workflows become custom.
  :::

  :::u-page-feature
  ---
  title: List Pages and Infinite Loading
  icon: i-lucide-table-properties
  to: /guides/list
  ---
  Build route-aware list screens with pagination, filters, sorters, and load-more patterns.
  :::
::

::u-page-section

#title
What Ginjou Handles

#features
  :::u-page-feature
  ---
  icon: i-lucide-list-tree
  orientation: vertical
  ---
  #title
  Resource-aware data flows

  #description
  Query and mutation composables understand resources, route state, cache invalidation, and optional realtime events.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-form-input
  orientation: vertical
  ---
  #title
  Page-level CRUD controllers

  #description
  Controllers such as useCreate, useEdit, useShow, useList, and useInfiniteList compose the lower-level pieces into reusable page logic.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-workflow
  orientation: vertical
  ---
  #title
  Progressive architecture

  #description
  Nothing is locked behind a monolithic provider. You can replace fetchers, auth, notifications, or routing one capability at a time.
  :::
::

::u-page-section

#title
Recommended Reading Order

#description
If you are new to the project, start here.

#features
  :::u-page-feature
  ---
  title: 1. Understand the model
  icon: i-lucide-compass
  to: /guides
  ---
  Read the introduction to see how providers, composables, and controllers fit together.
  :::

  :::u-page-feature
  ---
  title: 2. Wire your app
  icon: i-lucide-plug-2
  to: /integrations
  ---
  Pick the integration that matches your stack and register the root contexts.
  :::

  :::u-page-feature
  ---
  title: 3. Choose a fetcher
  icon: i-lucide-cable
  to: /backend
  ---
  Start with a built-in backend provider, or implement a custom fetcher when your API contract is unique.
  :::
::
