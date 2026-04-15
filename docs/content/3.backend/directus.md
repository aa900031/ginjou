---
title: Directus
description: 說明 @ginjou/with-directus 的 fetcher 映射與 auth 整合。
---

<!-- TODO: 寫介紹，說明這個 package 提供 Directus fetcher 與 auth bridge，而不是另一套獨立使用方式 -->

## Installation

<!-- TODO: 寫介紹，提示必須要安裝 @directus/sdk -->

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

### Sorters

<!-- TODO: 介紹如何轉換成 directus 的格式 -->

### Meta

<!-- TODO: 介紹 meta 使用方式，並明確標示目前以 `meta.query` 與 `meta.aggregate` 為已驗證入口 -->
<!-- TODO: 範例：meta.query -->
<!-- TODO: 範例：meta.aggregate -->

## Auth

<!-- TODO: 介紹要如何與 Ginjou 的 Auth 結合 -->

### Login

<!-- TODO: 介紹 auth.login 對應的 directus client function -->
<!-- TODO: 範例：帳號密碼登入 -->
<!-- TODO: 範例：SSO 登入 -->
<!-- TODO: 用表格列出目前支援的登入方式，和對應的 directus client function；僅列 password 與 sso 兩種已驗證方法 -->

### Logout

<!-- TODO: 介紹 auth.logout 對應的 directus client function -->

### Identity

<!-- TODO: 介紹 auth.getIdentity 對應的 directus client function -->

### Check Authentication

<!-- TODO: 介紹 auth.check 對應的 directus client function -->

### Check Error

<!-- TODO: 介紹 auth.checkError 如何判斷 Directus auth errors，並說明何時會回傳 logout: true -->
