---
id: be-09
title: "CORS 與瀏覽器"
mountain: backend
layer: 2
status: discussed
summary: "CORS 是瀏覽器執行的規則，不是資料防護；Postman 打得通不代表瀏覽器會放行。"
evidence: []
evidenceNote: "Day 02 討論、11/10 測驗（PROGRESS.md B10 為 L1，尚無證據編號）"
weeks: [W3]
related: [be-23]
abbr: [CORS, VPN]
sources:
  - title: "MDN：跨來源資源共享（CORS）"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

TODO：待使用者補上自己的前端類比。

## 說明

CORS 控制瀏覽器是否讓網頁讀取跨來源回應（Day 02）。

## 易混淆點

- Postman 桌面版打得通，只驗證了該次請求能到達後端並取得回應。
- 私人資料仍由後端檢查身分和權限，CORS 不是授權機制。
- VPN 提供進入公司測試網路的路徑，和 CORS 是不同層的問題。

## 還沒做的

- PROGRESS.md B10：待瀏覽器對照實測（W3）。
