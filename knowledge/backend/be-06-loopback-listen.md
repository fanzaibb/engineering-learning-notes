---
id: be-06
title: "Loopback 與監聽位址"
mountain: backend
layer: 1
status: discussed
summary: "127.0.0.1 只通到同一個網路環境；容器裡要監聽 0.0.0.0，外面才連得到。"
evidence: []
evidenceNote: "11/10 複習測驗（PROGRESS.md 尚無對應證據編號）"
weeks: [W1]
related: [be-15, be-27]
abbr: [IPv4]
sources:
  - title: "Node.js 文件：net 模組"
    url: https://nodejs.org/api/net.html
    kind: official
updated: 2026-11-11
---

## 說明

`127.0.0.1` 和 `::1` 指向本機。監聽 `127.0.0.1` 時只能從本機連入，`0.0.0.0` 表示監聽所有本機 IPv4 介面（Day 01）。

## 易混淆點

- 容器有自己的網路環境，容器內的「本機」不是主機的本機（設計畫布結論；11/10 複習筆記待補）。
- 連線逾時、連線被拒絕、資料庫密碼錯誤是不同的排查線索；「被拒絕」常代表服務沒有在那個位址監聽（Day 02）。

## 還沒做的

- TODO：在容器內分別監聽兩種位址，從主機實測差異。
