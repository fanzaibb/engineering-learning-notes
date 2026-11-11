---
id: be-21
title: "身分驗證與授權"
mountain: backend
layer: 5
status: discussed
summary: "驗證回答你是誰，授權回答你能做什麼，兩件事分開檢查。"
evidence: []
evidenceNote: "尚無實作（PROGRESS.md B08 為 L1）"
weeks: [W3]
related: [be-22, be-23]
abbr: [RBAC]
sources:
  - title: "OWASP Authorization Cheat Sheet"
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
    kind: engineering
updated: 2026-11-11
---

## 說明

Day 01 在 Azure 討論過 RBAC：角色指派由 Principal（誰）、Role（能做什麼）、Scope（涵蓋範圍）組成，上層指派向下繼承。

## 易混淆點

- 管理平面（Control Plane）和資料平面（Data Plane）的權限分開：Owner 不直接授予 Blob 資料權限（Day 01）。

## 還沒做的

- PROGRESS.md B08：記帳後端尚未實作登入（W3）。
