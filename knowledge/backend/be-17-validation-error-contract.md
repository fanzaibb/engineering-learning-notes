---
id: be-17
title: "輸入驗證與錯誤契約"
mountain: backend
layer: 4
status: guided
summary: "錯誤回應固定成 code／message／field，前端依 code 決定行為。"
evidence: [E14]
evidenceNote: "10 個錯誤案例"
weeks: [W2]
related: [be-08, be-19]
abbr: [JSON]
sources:
  - title: "RFC 9110：HTTP Semantics"
    url: https://www.rfc-editor.org/rfc/rfc9110
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

前端依 `error.code` 處理行為，文案可以集中管理（Day 04）。

## 說明

server.ts 以 `sendError` 統一 `error.code`、`message` 與選填 `field`；金額、分類、JSON、內容大小、內容型別與 404 都有可辨識的代碼（Day 04）。

## 易混淆點

- 測試可以共用部分定義，但不能只照讀實作設定而失去獨立需求驗證（Day 04）。

## 我做過什麼

- 帶做：POST／PUT 非法輸入、JSON／內容型別／大小限制、404 共 10 個錯誤案例通過（E14）。

## 還沒做的

- 500 格式尚未注入故障實測；資料庫錯誤分類映射待實作（E14 註記）。
