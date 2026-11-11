---
id: be-25
title: "版本衝突控制"
mountain: backend
layer: 6
status: discussed
summary: "兩個分頁同時存同一筆，用版本條件拒絕過期的覆寫。"
evidence: []
evidenceNote: "尚無（PROGRESS.md B12：gallery 整份儲存案例）"
weeks: [W4]
related: [be-24]
abbr: []
sources:
  - title: "八週課綱（curriculum/SYLLABUS.md）"
    kind: course
updated: 2026-11-11
---

## 用前端經驗來想

前端競態是過時回應覆蓋畫面，後端競態可來自多使用者同時修改（Day 04）。

## 還沒做的

- PROGRESS.md B12：待兩個重疊更新的驗證。
