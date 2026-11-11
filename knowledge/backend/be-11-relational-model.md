---
id: be-11
title: "關聯模型：PK／FK／JOIN"
mountain: backend
layer: 3
status: guided
summary: "主鍵識別每一列，外鍵維持表與表的關聯，JOIN 把它們接回來。"
evidence: [E08]
evidenceNote: "users／expenses 建表、JOIN 查到兩筆"
weeks: [W1]
related: [be-12]
abbr: [PK, FK]
sources:
  - title: "PostgreSQL 教學"
    url: https://www.postgresql.org/docs/current/tutorial.html
    kind: official
  - title: "PostgreSQL 17：約束"
    url: https://www.postgresql.org/docs/17/ddl-constraints.html
    kind: official
updated: 2026-11-11
---

## 說明

Day 04 建立 `users` 與 `expenses` 兩張表，記帳紀錄以外鍵指向使用者，再用 JOIN 查回。

## 易混淆點

- PostgreSQL 的 schema 也指收納資料表的命名空間（例如 `public`），和「結構定義」不同（Day 04）。

## 我做過什麼

- 帶做：建立 users／expenses 表，JOIN 查到兩筆；外鍵拒絕不存在的使用者 999 且沒有新增資料（E08）。

## 還沒做的

- PROGRESS.md B02：其他約束與獨立驗收待後續。
