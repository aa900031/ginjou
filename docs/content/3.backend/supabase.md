---
title: Supabase
description: TODO: 簡介這頁要做什麼
---

<!-- TODO: 寫介紹 -->

## Installation

<!-- TODO: 寫介紹，提示必須要安裝 supabase js client -->

::code-group
---
sync: package-manager
---

```bash [pnpm]
pnpm add @ginjou/with-supabase @supabase/supabase-js
```

```bash [yarn]
yarn add @ginjou/with-supabase @supabase/supabase-js
```

```bash [npm]
npm install @ginjou/with-supabase @supabase/supabase-js
```

```bash [bun]
bun add @ginjou/with-supabase @supabase/supabase-js
```

<!-- TODO: supabase js client 支援版本對應表 -->

::

## Fetcher

<!-- TODO: 介紹要如何與 Ginjou 的 Fetcher 結合 -->
<!-- TODO: 介紹 createFetcher 的 params 分別做什麼 -->
<!-- TODO: 範例: 用 CodeGroup 實做 Vue, Nuxt 該怎麼引入 @injou/with-supabase 的 createFetcher  -->

### Pagination

<!-- TODO: 介紹如何轉換成 supabase 的格式 -->

### Filters

<!-- TODO: 請寫 mapping 表格，表示 operator 如何轉換成 supabase 的格式 -->

### Sorts

<!-- TODO: 介紹如何轉換成 supabase 的格式 -->

### Meta

<!-- TODO: 介紹 meta 使用方式 -->
<!-- TODO: 範例：meta.idColumnName -->
<!-- TODO: 範例：meta.select -->

## Auth

<!-- TODO: 介紹要如何與 Ginjou 的 Auth 結合 -->

### Login

<!-- TODO: 介紹 auth.login 對應的 supabase js client function -->
<!-- TODO: 範例：帳號密碼登入 -->
<!-- TODO: 範例：OAuth 登入 -->
<!-- TODO: 用表格列出目前支援的登入方式，和對應的 supabase js client function -->

### Logout

<!-- TODO: 介紹 auth.logout 對應的 supabase js client function -->

### Identity

<!-- TODO: 介紹 auth.getIdentity 對應的 supabase js client function -->

### Check

<!-- TODO: 介紹 auth.check 對應的 supabase js client function -->
