---
id: be-12
title: "約束與型別"
mountain: backend
layer: 3
status: guided
summary: "資料庫端的約束是最後一道防線；外鍵拒絕 999 證明檢查發生在資料庫層。"
evidence: [E08, E11]
evidenceNote: "E11 為部分"
weeks: [W1]
related: [be-11, be-16]
abbr: []
sources:
  - title: "PostgreSQL 17：約束"
    url: https://www.postgresql.org/docs/17/ddl-constraints.html
    kind: official
  - title: "Evolutionary Database Design"
    url: https://martinfowler.com/articles/evodb.html
    kind: engineering
updated: 2026-11-11
---

## 說明

金額以整數「分」儲存，對外以「元」呈現（Day 04）。約束讓不合法的資料在資料庫層被拒絕。

## 易混淆點

- 收緊欄位限制前，先控制新輸入，再處理舊資料，最後加約束；舊資料怎麼處理由業務需求決定（Day 04）。

## 我做過什麼

- 帶做：外鍵拒絕 999（E08）。
- 帶做：PUT 更新時非法輸入不改資料（E11，部分）。

## 還沒做的

- PROGRESS.md 術語回訪：NULL／型別／約束在 W2 驗證與 migration 再回訪。
