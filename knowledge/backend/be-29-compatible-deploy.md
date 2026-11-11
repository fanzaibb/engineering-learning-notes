---
id: be-29
title: "相容部署"
mountain: backend
layer: 7
status: discussed
summary: "先擴張再收縮：過渡期新舊版本同時都要能運作。"
evidence: []
evidenceNote: "Day 02 討論、11/10 複習"
weeks: [W5]
related: [be-16]
abbr: []
sources:
  - title: "Martin Fowler：Parallel Change"
    url: https://martinfowler.com/bliki/ParallelChange.html
    kind: engineering
  - title: "Evolutionary Database Design"
    url: https://martinfowler.com/articles/evodb.html
    kind: engineering
updated: 2026-11-11
---

## 說明

前端先上傳新版程式檔，再發布指向新檔的 `index.html`；保留舊檔一段時間，讓開著的舊分頁還能載入延遲下載的檔案（Day 02）。

把記帳金額從 `amount` 過渡到 `amount_cents`：先增加欄位並補齊舊資料，過渡期維持新舊讀寫相容（Day 02）。

## 易混淆點

- 請求同時帶兩欄且金額不一致時回 `400`，避免存入有歧義的值（Day 02）。
- 切換驗證包含從舊分頁新增，再用新分頁讀回（Day 02）。

## 還沒做的

- TODO：W5 部署單元實際演練。
