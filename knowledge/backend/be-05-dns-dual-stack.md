---
id: be-05
title: "DNS 與 IPv4／IPv6 並存"
mountain: backend
layer: 1
status: discussed
summary: "DNS 可能同時回 A 與 AAAA 記錄，裝置依網路選一個；兩套位址彼此不相容。"
evidence: []
evidenceNote: "11/10 複習（PROGRESS.md 尚無對應證據編號）"
weeks: [W1]
related: [be-06]
abbr: [DNS, IPv4, IPv6, IP, NAT]
sources:
  - title: "八週課綱（curriculum/SYLLABUS.md）"
    kind: course
updated: 2026-11-11
---

## 說明

DNS 將網域名稱解析成可供連線的 IP 位址等資訊。IPv4 和 IPv6 是兩種 IP 位址格式，介面可以有自己的位址（Day 01）。

TODO：11/10 複習內容的筆記尚未放進倉庫，A／AAAA 記錄的細節待補。

## 易混淆點

- NAT 讓家用路由器下私有 IPv4 位址的裝置對外連線，和 IPv6 是兩回事。

## 還沒做的

- TODO：用 `dig` 或 `nslookup` 實際查一個同時有 A 與 AAAA 的網域。
