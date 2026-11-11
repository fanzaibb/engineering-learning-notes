---
id: be-03
title: "IP、MAC 與 ARP"
mountain: backend
layer: 1
status: guided
summary: "IP 是最終目的地，MAC 只是這一段的下一手；ARP 把下一手的 IP 換成 MAC。"
evidence: [E02]
evidenceNote: "arp -n"
weeks: [W1]
related: [be-02]
abbr: [IP, MAC, ARP, IPv4]
sources:
  - title: "RFC 826：ARP"
    url: https://www.rfc-editor.org/rfc/rfc826
    kind: official
updated: 2026-11-11
---

## 用前端經驗來想

TODO：待使用者補上自己的前端類比。

## 說明

封包要送到 `8.8.8.8`：路由表選出第一站（預設閘道），ARP 表提供這一段傳送所需的目的 MAC 位址。ARP 在本地鏈路上由下一站的 IPv4 位址找到它的 MAC 位址。

## 易混淆點

- 目的 IP 在整段旅程中不變，目的 MAC 每一段都換成「下一手」。
- Day 01 時這部分列為「尚未理解」，Day 02 用實際指令補上。

## 我做過什麼

- 帶做：`arp -n 192.168.0.1` 查到閘道在本機 ARP 表中已有 MAC 對應（E02）。

## 還沒做的

- TODO：用自己的話說明換網段時 MAC 怎麼變，作為獨立驗收。
