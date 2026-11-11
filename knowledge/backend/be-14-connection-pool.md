---
id: be-14
title: "連線池借還"
mountain: backend
layer: 3
status: guided
summary: "連線借了一定要還；閒置保留多久是延遲與資源的取捨。"
evidence: [E08, E12]
evidenceNote: "交易內借還待 W4"
weeks: [W1]
related: [be-24]
abbr: []
sources:
  - title: "node-postgres：Pooling"
    url: https://node-postgres.com/features/pooling
    kind: official
updated: 2026-11-11
---

## 說明

後端使用 pg 連線池。閒置連線仍占資源，保留與關閉是延遲和資源的取捨（Day 04）。

## 易混淆點

- 30 秒是目前設定，不是通用最佳值（Day 04）。

## 我做過什麼

- 帶做：Node 連線查詢成功（E08）。
- 帶做：db.ts 加入閒置連線 error 事件處理，資料庫容器重啟後服務恢復（E12）。

## 還沒做的

- 進行中查詢的失敗與重試尚未演練（E12 註記）；交易內借還待 W4。
