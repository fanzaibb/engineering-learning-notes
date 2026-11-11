---
id: be-26
title: "冪等鍵與重送"
mountain: backend
layer: 6
status: discussed
summary: "同一次操作重試沿用同一把鍵，資料庫唯一約束保證只處理一次。"
evidence: []
evidenceNote: "Day 05 概念討論（PROGRESS.md B13：曾規劃）"
weeks: [W4]
related: [be-20, be-24]
abbr: []
sources:
  - title: "PostgreSQL 17：約束"
    url: https://www.postgresql.org/docs/17/ddl-constraints.html
    kind: official
updated: 2026-11-11
---

## 說明

冪等鍵由呼叫端為一次操作產生，重試時沿用同一把（Day 05）。

## 易混淆點

- 每次都產生新鍵就擋不住連發（Day 05）。
- 後端仍需要唯一約束、交易與重複結果處理（Day 05）。

## 還沒做的

- PROGRESS.md B13：待併發同鍵新增與不同內容衝突測試。
