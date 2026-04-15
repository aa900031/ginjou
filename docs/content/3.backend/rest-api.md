---
title: RESTful API
description: TODO: 簡介這頁要做什麼
---

<!-- TODO: 寫介紹，需要和使用者說 spec 是照著 [json-server](https://github.com/typicode/json-server) 實作 -->

## Installation

::code-group
---
sync: package-manager
---

```bash [pnpm]
pnpm add @ginjou/with-rest-api
```

```bash [yarn]
yarn add @ginjou/with-rest-api
```

```bash [npm]
npm install @ginjou/with-rest-api
```

```bash [bun]
bun add @ginjou/with-rest-api
```

::

## Fetcher

<!-- TODO: 介紹要如何與 Ginjou 的 Fetcher 結合 -->
<!-- TODO: 介紹 createFetcher 的 params 分別做什麼 -->
<!-- TODO: 範例: 用 CodeGroup 實做 Vue, Nuxt 該怎麼引入 @injou/with-rest-api 的 createFetcher  -->

### URLs

<!-- TODO: 用表格的方式表示 Ginjou fetcher method 會組成哪種 url e.g: (method: `getList`, path: `{url}/{resource}`, query: [`pagination`, `sorters`, `filters`], body: null), (method: `updateOne`, path: `{url}/{resource}`, query: null, body: `{params}`) -->

### Pagination

<!-- TODO: 介紹如何轉換成 json-server 的格式 -->

### Filters

<!-- TODO: 請寫 mapping 表格，表示 operator 如何轉換成 json-server 的格式，和會有哪些限制 -->

### Sorts

<!-- TODO: 如何轉換成 json-server 的格式 -->

### Meta

<!-- TODO: 介紹 meta.method, meta.headers 要怎麼使用 -->
<!-- TODO: 範例 -->
