---
id: be-15
title: "容器、映像與資料卷"
mountain: backend
layer: 3
status: guided
summary: "映像是模板、容器是執行中的實例，資料放資料卷才不會跟著容器消失。"
evidence: [E08, E12]
evidenceNote: "容器重啟後三筆資料保留"
weeks: [W1]
related: [be-27]
abbr: []
sources:
  - title: "Docker 文件：Volumes"
    url: https://docs.docker.com/engine/storage/volumes/
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

TODO：待使用者補上自己的前端類比。

## 說明

Day 04 啟動 PostgreSQL 17 容器並掛載資料卷。

## 我做過什麼

- 帶做：啟動 PostgreSQL 17 容器、建立資料卷（E08）。
- 帶做：重啟 expense-postgres 後，HTTP 列表三筆資料與重啟前一致（E12）。

## 還沒做的

- PROGRESS.md B03：容器重建及獨立驗收待後續。
