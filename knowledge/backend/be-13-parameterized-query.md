---
id: be-13
title: "參數化查詢"
mountain: backend
layer: 3
status: guided
summary: "外部輸入只當資料、不當指令，從根本擋住 SQL 注入。"
evidence: [E09]
evidenceNote: "POST 改參數化寫入"
weeks: [W1, W2]
related: [be-17]
abbr: [SQL]
sources:
  - title: "node-postgres：Queries"
    url: https://node-postgres.com/features/queries
    kind: official
updated: 2026-11-11
---

## 說明

後端用 pg 的參數化查詢寫入，SQL 文字與使用者輸入分開送給資料庫。

## 我做過什麼

- 帶做：列表改查 PostgreSQL，POST 改參數化寫入並轉換元／分；正常新增查回、五種非法金額拒絕已驗證（E09）。

## 還沒做的

- TODO：獨立驗收（PROGRESS.md B04）。
