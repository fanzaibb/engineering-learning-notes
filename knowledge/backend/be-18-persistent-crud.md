---
id: be-18
title: "持久化 CRUD"
mountain: backend
layer: 4
status: guided
summary: "五個端點都接資料庫；金額存整數分，對外以元呈現。"
evidence: [E10, E11]
evidenceNote: "新增→查回→更新→刪除"
weeks: [W1]
related: [be-13]
abbr: [CRUD]
sources:
  - title: "node-postgres：Queries"
    url: https://node-postgres.com/features/queries
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

刪除後 refetch 列表是合理做法；刪除成功但列表刷新失敗時，要區分是哪個階段出錯（Day 04）。

## 說明

列表、單筆、新增、更新、刪除都改為資料庫持久化，移除記憶體儲存。目前固定 Demo 使用者 1，尚無登入與逐筆授權（Day 04）。

## 我做過什麼

- 帶做：單筆 GET 與 DELETE 移轉 PostgreSQL；新增→查回→刪除 204→再查／再刪 404 通過（E10）。
- 帶做：新增 PUT，與 POST 共用驗證，錯誤格式 400／415 與不存在編號 404 通過（E11）。

## 還沒做的

- 正常 CRUD 流程尚未保存到 npm test（Day 04）。
