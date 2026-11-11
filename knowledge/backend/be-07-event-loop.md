---
id: be-07
title: "Event Loop 與阻塞"
mountain: backend
layer: 2
status: guided
summary: "同步的長計算會卡住所有請求，等待型的工作不會。"
evidence: [E01]
evidenceNote: "/slow 與 /fast"
weeks: [W1]
related: [be-08]
abbr: [HTTP, CPU]
sources:
  - title: "Node.js：Event Loop、計時器與 process.nextTick()"
    url: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
    kind: official
  - title: "Node.js：Don’t Block the Event Loop"
    url: https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

（整理者補充）和瀏覽器一樣：主執行緒跑一段很長的同步迴圈時，畫面會卡住；Node.js 的伺服器則是所有請求一起卡住。

## 說明

- **Call Stack（呼叫堆疊）** 上的同步 JavaScript 會一路執行到返回，執行越久，其他回呼越晚得到機會。
- **Event Loop（事件迴圈）** 在工作就緒時執行對應回呼。網路 I/O 由作業系統通知就緒，部分檔案系統操作用 libuv 的工作執行緒池。
- **`async`／`await`** 讓非同步流程寫起來像同步；`await` 暫停目前函式的後續步驟。
- **`worker_threads`** 另開執行緒跑 JavaScript，可分擔 CPU 密集運算。

## 易混淆點

- 把耗時迴圈放進 `async` 函式，迴圈本身仍然占用執行它的執行緒。
- libuv 工作執行緒池服務的是部分底層 API，和 `worker_threads` 不同。

## 我做過什麼

- 帶做：比較 `/slow` 與 `/fast` 兩個路由；同步 CPU 密集的 `/slow` 會讓 `/fast` 也得等，改成非同步等待後 `/fast` 可以先回應（E01）。

## 還沒做的

- TODO：用 `worker_threads` 把 CPU 密集工作移出主執行緒並實測。
