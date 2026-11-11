---
id: be-20
title: "冪等性"
mountain: backend
layer: 4
status: discussed
summary: "做一次和做很多次的結果相同就是冪等，回應碼可以不同。"
evidence: []
evidenceNote: "Day 05 討論"
weeks: [W1]
related: [be-26]
abbr: []
sources:
  - title: "RFC 9110：HTTP Semantics"
    url: https://www.rfc-editor.org/rfc/rfc9110
    kind: official
updated: 2026-11-11
---

## 說明

冪等性看的是重複操作的預期效果是否相同，不要求每次實際執行的步驟或回應碼相同（Day 05）。

## 易混淆點

- 重複刪除先回 204、再回 404，回應碼不同，仍可以符合冪等性（Day 05）。
