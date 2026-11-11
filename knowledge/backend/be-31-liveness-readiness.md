---
id: be-31
title: "存活與就緒檢查"
mountain: backend
layer: 7
status: discussed
summary: "程式活著不代表能接流量；就緒檢查要真的連一次資料庫。"
evidence: []
evidenceNote: "Day 02 討論"
weeks: [W6]
related: [be-30]
abbr: []
sources:
  - title: "Kubernetes：存活、就緒與啟動探針"
    url: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
    kind: official
updated: 2026-11-11
---

## 說明

更換資料庫帳密後，舊連線可能仍能查詢。部署驗證應包含建立新連線及實際查詢，因為只檢查程序存活的 `/health` 無法驗證資料庫連線（Day 02）。

## 易混淆點

- Day 04 容器重啟測試中 health 回 200，但 health 本身不檢查資料庫，另以列表查詢驗證（Day 04）。

## 還沒做的

- TODO：實作會連資料庫的就緒檢查（W6）。
