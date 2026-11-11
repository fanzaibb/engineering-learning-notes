---
id: be-24
title: "交易、提交與回滾"
mountain: backend
layer: 6
status: discussed
summary: "一包修改全部成功或全部撤銷；交易不會自動解決所有併發問題。"
evidence: []
evidenceNote: "尚無，待失敗注入（概念討論見 PROGRESS.md B11）"
weeks: [W4]
related: [be-14, be-25]
abbr: []
sources:
  - title: "PostgreSQL 17：交易"
    url: https://www.postgresql.org/docs/17/tutorial-transactions.html
    kind: official
  - title: "node-postgres：Transactions"
    url: https://node-postgres.com/features/transactions
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

TODO：待使用者補上自己的前端類比。

## 說明

交易提供相關修改的原子性（Day 04）。

## 易混淆點

- 交易不自動消除所有競態；庫存條件式更新與交易是概念預習，未做實驗（Day 04）。

## 還沒做的

- PROGRESS.md B11：待失敗注入與回滾、歸還測試。
