---
id: be-08
title: "HTTP 請求與回應"
mountain: backend
layer: 2
status: guided
summary: "狀態碼、標頭、本文各有分工；204 沒有本文，不能直接解析 JSON。"
evidence: [E04]
evidenceNote: "201／204／404 已驗證"
weeks: [W1]
related: [be-04, be-17]
abbr: [HTTP, JSON, API]
sources:
  - title: "MDN HTTP 概觀"
    url: https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Overview
    kind: official
  - title: "RFC 9110：HTTP Semantics"
    url: https://www.rfc-editor.org/rfc/rfc9110
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

`fetch` 收到 400／500 仍可能正常取得回應，要檢查 `status`／`ok`；204 沒有內容，不應直接解析 JSON（Day 04）。

## 說明

HTTP 定義請求與回應的結構。`curl -i` 可以同時看到狀態列、標頭和本文。Expense API 的 `POST` 流程是：接收本文 → 解析 JSON → 驗證 → 寫入 → 回傳 JSON（Day 01）。

## 易混淆點

- 程式設定了 `201 Created` 不等於驗證過；Day 01 的新增回應只看到本文，狀態碼到 E04 才直接觀察。
- `node:net` 處理 TCP 位元組；`node:http` 在上面處理請求、標頭與本文。

## 我做過什麼

- 帶做：直接觀察新增 201、刪除 204、刪後空列表、重複刪除 404（E04）。
- 帶做：Day 01 以 `curl` 測 `GET /expenses` 200、錯誤型別 400、不存在路由 404（E01）。

## 還沒做的

- TODO：獨立寫出一個新端點並自行決定狀態碼。
