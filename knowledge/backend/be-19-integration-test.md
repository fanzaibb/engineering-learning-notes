---
id: be-19
title: "整合測試與隔離環境"
mountain: backend
layer: 4
status: guided
summary: "每次測試自建臨時資料庫與後端，結束清理，失敗也不汙染開發資料。"
evidence: [E15, E16, E17, E18]
evidenceNote: "錯誤案例、隔離環境、新增查回與完整生命週期"
weeks: [W2]
related: [be-17]
abbr: []
sources:
  - title: "Node.js 文件：Test runner"
    url: https://nodejs.org/api/test.html
    kind: official
  - title: "Software Engineering at Google：Testing Overview"
    url: https://abseil.io/resources/swe-book/html/ch11.html
    kind: engineering
updated: 2026-11-11
---

## 用前端經驗來想

TODO：待使用者補上自己的前端類比。

## 說明

Integration test（整合測試）實際呼叫服務並檢查契約；fixture（測試基礎資料）讓起始狀態可預期（Day 04）。

目前只要求理解「準備 → 啟動 → 測試 → 清理」，以及測試案例與環境管理的分工；啟動器的程序管理細節延後到部署單元。

## 易混淆點

- 隔離的是資料庫與後端程序，仍共用同一個 PostgreSQL 服務。
- 強制終止或主機當機可能留下資源。

## 我做過什麼

- 帶做：npm test 跑 10 個錯誤案例與 1 個資料保留檢查，含父測試 12 項通過（E15）。
- 帶做：自建唯一臨時資料庫、套用 schema／seed／fixture、啟動獨立後端並清理；刻意失敗也確認非零退出與清理（E16）。
- 帶做：補上正常 POST → GET 單筆測試，驗證 201、有效 id、200 與內容一致（E17）。
- 帶做：完整記帳生命週期測試：新增 → 查回 → 改 150 元 → 查回 → 刪除 204 空內容 → 再查 404 → 再刪 404，npm test 13 項全通過（E18）。

## 還沒做的

- 500 故障注入測試待補。
- 13 項是同一正常流程內的斷言，不是 13 個獨立業務情境（Day 05）。
