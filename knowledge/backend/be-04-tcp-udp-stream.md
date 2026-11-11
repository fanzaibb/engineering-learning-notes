---
id: be-04
title: "TCP、UDP 與位元組串流"
mountain: backend
layer: 1
status: guided
summary: "TCP 給的是有序位元組串流，一次 write 不等於一次 data，訊息邊界要自己定。"
evidence: [E01]
evidenceNote: "node:net、nc"
weeks: [W1]
related: [be-08, be-10]
abbr: [TCP, UDP, HTTP, IP]
sources:
  - title: "RFC 9293：TCP"
    url: https://www.rfc-editor.org/rfc/rfc9293
    kind: official
  - title: "Node.js 文件：net 模組"
    url: https://nodejs.org/api/net.html
    kind: official
updated: 2026-11-11
---

## 說明

TCP 透過 `SYN → SYN-ACK → ACK` 建立連線，向應用程式提供可靠、有序的位元組串流。UDP 以資料報為單位傳送，本身沒有交握、重傳和排序。

用分層看一次 HTTP 請求：HTTP 組織訊息 → TCP 傳送位元組 → IP 負責定址與轉送 → 鏈路處理當前一段。

## 易混淆點

- **一次 `write()` 和一次 `data` 事件沒有一對一關係。** 兩次寫入可能合在一次讀取，一次寫入也可能分段收到。要分辨訊息就自己定切分方式，例如換行或長度欄位。
- 從終端機輸入 `Hello` 加換行收到 6 bytes，`socket.write('Hello')` 送 5 bytes，差的是換行。
- HTTP/1.1 和 HTTP/2 通常用 TCP，HTTP/3 用以 UDP 為基礎的 QUIC。
- `Transfer-Encoding: chunked` 讓接收端能從 TCP 位元組串流讀出完整的 HTTP 本文。

## 我做過什麼

- 帶做：用 `node:net` 建立 TCP Server，分別用 `nc` 與 Node.js Client 傳資料（E01）。
- 帶做：用 `lsof` 觀察 `LISTEN` 與 `ESTABLISHED`（E01）。

## 還沒做的

- Day 01「待複習」：OSI 與 TCP/IP 分層、TCP 串流與 HTTP 訊息邊界。
