---
id: be-02
title: "路由與預設閘道"
mountain: backend
layer: 1
status: guided
summary: "沒有更具體的路由就交給預設閘道，路由表選最長前綴那條。"
evidence: [E01, E02]
evidenceNote: "route、traceroute"
weeks: [W1]
related: [be-01, be-03]
abbr: [IPv4, BGP, TTL, RTT]
sources:
  - title: "RFC 4632：CIDR"
    url: https://www.rfc-editor.org/rfc/rfc4632
    kind: official
  - title: "八週課綱（curriculum/SYLLABUS.md）"
    kind: course
updated: 2026-11-11
---

## 用前端經驗來想

TODO：待使用者補上自己的前端類比。

## 說明

以本機 `192.168.1.10/24`、預設閘道 `192.168.1.1` 為例：

1. 連 `192.168.1.20` 時，符合直接連線的 `192.168.1.0/24` 路由，在區域網路內送達。
2. 連 `8.8.8.8` 時，沒有更具體的路由，就匹配 IPv4 預設路由 `0.0.0.0/0`，先交給 `192.168.1.1`。這時封包的目的 IP 仍是 `8.8.8.8`。
3. 沿途每台路由器依自己的路由表決定下一跳。多條路由都符合時，前綴最長的優先。

路由資訊可以來自直接連線的網段、手動設定或動態路由；BGP 用來在不同自治系統之間交換網段可達資訊。

## 易混淆點

- `0.0.0.0/0` 匹配所有 IPv4 位址，`/32` 只匹配單一位址。
- 路由決定怎麼送，安全性規則（例如 NSG）決定是否允許通過。
- `traceroute` 的星號只表示該次探測沒收到回應。

## 我做過什麼

- 帶做：`route -n get default` 查預設閘道，`route -n get 8.8.8.8` 確認走同一閘道（E02）。
- 帶做：`traceroute -n -m 3 -q 1 8.8.8.8` 探測前三跳，確認第一跳是預設閘道；三個探測封包的 TTL 分別是 1、2、3（E02）。
- Day 01 討論 `route`、`traceroute`、`ping` 的觀察方式（E01）。

## 還沒做的

- PROGRESS.md A13：Azure 自訂路由尚未實作。
