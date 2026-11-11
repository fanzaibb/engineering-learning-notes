---
id: be-01
title: "IPv4 子網路與 CIDR"
mountain: backend
layer: 1
status: guided
summary: "前綴越長、網段越小；Azure 每個子網路另保留 5 個位址。"
evidence: [E02]
evidenceNote: "兩個 /25 子網路"
weeks: [W1]
related: [be-02]
abbr: [IPv4, CIDR, IP, VNet]
sources:
  - title: "RFC 4632：CIDR"
    url: https://www.rfc-editor.org/rfc/rfc4632
    kind: official
  - title: "Azure 虛擬網路常見問題（子網路保留位址）"
    url: https://learn.microsoft.com/azure/virtual-network/virtual-networks-faq
    kind: official
updated: 2026-11-11
---

## 說明

IPv4 位址共 32 位元，分成四組，每組 8 位元，所以每組十進位是 0 到 255。子網路遮罩的 `1` 表示網路前綴，`0` 表示網段內可區分的位址。`255.255.255.0` 前面有 24 個連續的 1，CIDR 寫成 `/24`。

把 IP 和遮罩做位元 AND，就得到網路位址：`192.168.1.10` 與 `192.168.1.20` 套 `/24` 都是 `192.168.1.0`，同一網段；`192.168.2.10` 在另一個網段。

每多固定一個前綴位元，位址範圍就減半：`/24` 有 256 個位址，`/25` 有 128 個，`/26` 有 64 個。

## 易混淆點

- 「比較前三組數字」只在 `/24` 這個例子成立，其他前綴長度要按位元數判斷。
- 一般 IPv4 `/24` 中，`.0` 是網路位址，`.255` 是廣播位址。
- Azure 每個子網路另外保留 5 個位址，可用數量比一般計算少（來源：Azure 虛擬網路常見問題）。

## 我做過什麼

- 帶做：用 Azure CLI 在 `10.0.1.0/24` 的 VNet 中建立 `10.0.1.0/25` 與 `10.0.1.128/25` 兩個子網路，確認 `Succeeded` 後清理資源群組（E02）。
- 練習：判斷 `10.0.1.20` 和 `10.0.1.150` 分別落在兩個 `/25`，連線會跨子網路（Day 02）。

## 還沒做的

- PROGRESS.md A13：peering、公開位址、自訂路由、真實連線診斷尚未勾選。
