---
title: Supabase
description: 說明 @ginjou/with-supabase 的 fetcher 映射與 auth 整合。
---

<!-- TODO: 寫介紹，說明這個 package 提供 Supabase fetcher 與 auth bridge，而不是改變上層 hooks 的使用方式 -->

## Installation

<!-- TODO: 寫介紹，提示必須要安裝 @supabase/supabase-js -->

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
<!-- TODO: 範例：用 CodeGroup 實做 Vue、Nuxt 該怎麼引入 @ginjou/with-supabase 的 createFetcher -->

### Pagination

<!-- TODO: 介紹如何轉換成 supabase 的格式 -->

### Filters

<!-- TODO: 請寫 mapping 表格，表示 operator 如何轉換成 supabase 的格式 -->
<!-- TODO: 明確列出目前不支援的 operator，例如 between、nbetween、and -->

### Sorters

<!-- TODO: 介紹如何轉換成 supabase 的格式 -->

### Meta

<!-- TODO: 介紹 meta 使用方式 -->
<!-- TODO: 範例：meta.idColumnName -->
<!-- TODO: 範例：meta.select -->
<!-- TODO: 範例：meta.count -->

## Auth

<!-- TODO: 介紹要如何與 Ginjou 的 Auth 結合 -->

### Login

<!-- TODO: 介紹 auth.login 對應的 supabase js client function -->
<!-- TODO: 範例：帳號密碼登入 -->
<!-- TODO: 範例：OAuth 登入 -->
<!-- TODO: 用表格列出目前支援的登入方式：password、oauth、idtoken、otp、sso、otp-token，並對應到 supabase auth client methods -->

### Logout

<!-- TODO: 介紹 auth.logout 對應的 supabase js client function -->

### Identity

<!-- TODO: 介紹 auth.getIdentity 對應的 supabase js client function -->

### Check Authentication

<!-- TODO: 介紹 auth.check 對應的 supabase js client function -->

### Check Error

<!-- TODO: 介紹 auth.checkError 如何借助 Supabase 的 isAuthError 判斷要不要 logout -->
