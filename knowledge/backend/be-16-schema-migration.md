---
id: be-16
title: "Schema 與 Migration"
mountain: backend
layer: 3
status: guided
summary: "Schema 是設計圖，Migration 是依序套用的施工單；結構快照不等於版本追蹤。"
evidence: [E13]
evidenceNote: "結構快照；migration 工具待 W2"
weeks: [W2]
related: [be-29]
abbr: []
sources:
  - title: "Evolutionary Database Design"
    url: https://martinfowler.com/articles/evodb.html
    kind: engineering
updated: 2026-11-11
---

## 說明

Migration 是事先準備的變更指令，不是執行後產生的 log。001／002 是順序編號，不是資料編號；工具可一次執行全部待套用變更（Day 04）。

## 易混淆點

- 已套用的 migration 通常新增下一份修正，不回頭改。
- 長期專案可建立 baseline，但既有環境要對齊紀錄，不能直接重跑建表。

## 我做過什麼

- 帶做：新增 db/schema.sql、seed.sql，在一次性空資料庫重建成功（E13）。

## 還沒做的

- PROGRESS.md B05：migration 版本追蹤、既有資料庫升級與獨立重建。
