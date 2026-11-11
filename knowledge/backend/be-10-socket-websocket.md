---
id: be-10
title: "Socket 與 WebSocket"
mountain: backend
layer: 2
status: discussed
summary: "Socket 是通訊端點；WebSocket 是在 TCP 上、由 HTTP 升級而來的雙向協定。"
evidence: []
evidenceNote: "11/10 複習（PROGRESS.md 尚無對應證據編號）"
weeks: []
related: [be-04]
abbr: [TCP, HTTP, IP]
sources:
  - title: "RFC 6455：WebSocket 協定"
    url: https://www.rfc-editor.org/rfc/rfc6455
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

TODO：待使用者補上自己的前端類比。

## 說明

Socket 是程式操作網路通訊的端點。Port 讓同一個 IP 上的連線能送到對應服務；`LISTEN` 表示等待連入，`ESTABLISHED` 表示 TCP 連線已建立（Day 01）。

TODO：WebSocket 的 11/10 複習筆記尚未放進倉庫。

## 還沒做的

- TODO：課綱尚未排定 WebSocket 實作週次。
