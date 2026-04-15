---
title: Directus
description: TODO: 簡介這頁要做什麼
---

<!-- TODO: 寫介紹 -->

## Installation

<!-- TODO: 寫介紹，提示必須要安裝 directus/sdk -->

::code-group
---
sync: package-manager
---

```bash [pnpm]
pnpm add @ginjou/with-directus @directus/sdk
```

```bash [yarn]
yarn add @ginjou/with-directus @directus/sdk
```

```bash [npm]
npm install @ginjou/with-directus @directus/sdk
```

```bash [bun]
bun add @ginjou/with-directus @directus/sdk
```

<!-- TODO: directus 支援版本對應表 -->

::

## Fetcher

<!-- TODO: 介紹要如何與 Ginjou 的 Fetcher 結合 -->
<!-- TODO: 介紹 createFetcher 的 params 分別做什麼 -->
<!-- TODO: 新增 resource 對照 Collections 和 System Collections 如何做轉換 -->

### Pagination

<!-- TODO: 介紹如何轉換成 directus 的格式 -->

### Filters

<!-- TODO: 請寫 mapping 表格，表示 operator 如何轉換成 directus 的格式 -->

### Sorts

<!-- TODO: 介紹如何轉換成 directus 的格式 -->

### Meta

<!-- TODO: 介紹 meta 使用方式 -->
<!-- TODO: 範例：meta.query -->
<!-- TODO: 範例：meta.aggregate -->
<!-- TODO: 範例：meta.groupBy -->

## Auth

<!-- TODO: 介紹要如何與 Ginjou 的 Auth 結合 -->

### Login

<!-- TODO: 介紹 auth.login 對應的 directus client function -->
<!-- TODO: 範例：帳號密碼登入 -->
<!-- TODO: 範例：SSO 登入 -->
<!-- TODO: 用表格列出目前支援的登入方式，和對應的 directus client function -->

### Logout

<!-- TODO: 介紹 auth.logout 對應的 directus client function -->

### Identity

<!-- TODO: 介紹 auth.getIdentity 對應的 directus client function -->

### Check

<!-- TODO: 介紹 auth.check 對應的 directus client function -->
