# Day05｜整合測試、GitHub 與 Azure 治理

日期：2026-11-10，臺灣時間。W1持續進行，部分W2測試提前帶做；實際時數未登錄。

## 已完成的實作與證據

### 後端整合測試

- 在既有隔離測試中補齊：新增午餐120元→單筆查回→更新為150元→查回→刪除204且內容為空→查詢404→再次刪除404。
- npm test實跑13項（含父測試）全通過，臨時資料庫及測試後端已清理。新增的是既有正常流程內的斷言，並非13個獨立業務情境。
- 程式由教練修改及驗證，屬帶做成果，不記為學員獨立完成。啟動器的程序、訊號等細節延後到部署單元，目前只要求掌握準備→啟動→測試→清理。

### GitHub與差異檢視

- 課程程式專案原本沒有Git，已初始化main，建立私有儲存庫：[expense-api](https://github.com/fanzaibb/expense-api)。
- 初始版本已推送；.env與node_modules排除，提供無密碼的.env.example與README。
- 初始化後新增的更新／刪除測試變更仍保留本機，未提交或推送。本次筆記PR不包含應用程式碼。
- VS Code在Mac可用Control＋Shift＋G開啟原始檔控制，再點修改檔案看相對Git基準的差異；聊天貼程式碼本身不會修改檔案。
- Day04紀錄與正式課綱已建立[PR #3](https://github.com/fanzaibb/engineering-learning-notes/pull/3)，尚未在本次對話確認合併。

### Azure角色、標籤與資源鎖

- 入口網站畫面確認目前帳號在訂閱層直接取得Owner，Scope的This resource指該訂閱，Group assignment為--。
- 在東亞建立空白rg-learning-day05，標籤Project=Learning、Environment=Test。
- 建立prevent-delete鎖；CLI列出CanNotDelete，嘗試刪除群組收到ScopeLocked，有截圖證據。
- 使用者解除鎖後刪除群組，回報az group exists為false，GUI重新整理後亦不存在。鎖實驗與該群組清理已完成。
- 已驗證Owner也受鎖限制，但可先解除鎖再刪除。沒有另外建立角色指派或測試第二個帳號。

### Azure Policy標籤實驗

- 使用內建Require a tag on resource groups（1.0.0），在練習訂閱建立指派day05-require-env，tagName=env，執行啟用，效果deny。
- 此Deny實驗不需建立受控識別；Modify／DeployIfNotExists等涉及修改或部署時，才另行處理執行身分與授權。
- 不帶標籤建立rg-policy-day05，確實回傳RequestDisallowedByPolicy。使用者貼出的評估結果明確指出tags[env]不存在，拒絕來源是本次指派。
- 同名群組加上env=Test後，使用者在語音回報建立成功；未取得完整成功輸出，不虛構額外驗證。
- **待收尾：rg-policy-day05是否已刪除，以及day05-require-env指派是否已移除，尚未收到確認。** 指派在訂閱層，未移除前仍可能阻擋其他缺env的群組建立或更新。原則不限制env的值必須是Test。

## 概念與易混淆點

- 冪等性看重複操作的預期效果是否相同，不要求每次實際執行步驟或回應碼相同；重複刪除204／404可以符合此性質。
- 冪等鍵由呼叫端為一次操作產生並於重試沿用。每次都產生新鍵無法防連發；後端仍需唯一約束、交易與重複結果處理。尚未實作。
- RBAC（Role-Based Access Control，以角色為基礎的存取控制）以主體、角色、作用範圍組成指派；一般角色權限累加並向下繼承，下層Reader不會抵銷上層Contributor。
- Owner通常能在自己範圍內替自己指派其他資料角色；沒有直接包含資料權限，不等於無法自行取得。資料庫本身的帳號與資料權限仍需另外看。
- 身分群組收納身分，資源群組收納資源。群組授權方便管理，但移出一個群組不代表其他權限來源一起消失。
- Policy是治理規則，不等同角色授權。Definition定義規則、Assignment指定範圍與參數、Initiative將多條規則組合。
- Audit記錄不符合，不因該條Audit阻擋；Deny實際拒絕適用請求。兩者都不會自動刪除或搬移既有資源。
- 上層Deny不會被下層較寬鬆原則抵銷；例外應透過適當排除或豁免處理。
- Tag為分類資訊，可表達專案、環境、團隊與成本中心；不自動授權，也不預設從資源群組複製到資源。
- Resource Policy Contributor是Azure權限角色，不是職稱；DevOps、平台、雲端或資安治理人員是否需要，取決於工作分工。
- 預算主要追蹤與通知，不自動封頂或停止資源。依使用者要求，成本管理細節延後，先優先實際使用流程；實驗費用確認與清理仍保留。

## 延伸討論：不是已完成的部署能力

- Region是部署的地理區域；Availability Zone是同區域內隔離故障的設施範圍；CDN（Content Delivery Network，內容傳遞網路）是邊緣傳遞／快取層。
- 同一服務多副本可由負載平衡分配請求，共用資料庫；後端多副本與資料庫主備是不同層，不能混稱整套備援已完成。
- 遊戲各區可以獨立資料，也可保留全球共用帳號；地理分區和故障備援目的不同。
- 不同國家訂單畫面分開，不足以證明實際資料庫完全分開。Amazon的部署細節不可從畫面臆測。
- 同表資料較多不代表每次全表掃描；查詢條件、索引、結果筆數和執行方式都影響成本。索引、分區與跨區資料同步留待後續。
- 閱讀Amazon官方Static stability using Availability Zones，頁面標示2019-12-05發布與修改。重點是預先準備故障所需容量、隔離故障及區分控制／資料平面，不是今天各國商城部署地圖。

## 教學與用量調整

- 顯示文字統一臺灣繁體中文，縮寫初次出現附全名。
- 使用者多次要求繼續；減少重複問是否要再比喻／再出題，沿課綱小步推進。
- 看畫面遇到入口不一致，先查官方與當前畫面，不反覆猜位置。
- Portal新版New Browse Experience未找到群組刪除入口，CLI已完成鎖實驗；官方有Portal刪除步驟，但文件與當前版面不同。建議關閉新版檢視是待驗證排查，不記為已解決。
- 官方文件指出桌面語音時間與背後任務會消耗方案共用額度；無帳號明細，不能估算今日各項占比。文字為主、必要時短語音有助控制用量。
- 課堂收尾同步共用筆記、證據、缺口與下次入口；程式成果與學員獨立能力分開記錄。

## 下次開課第一步

1. 先確認Policy實驗清理：rg-policy-day05不存在，day05-require-env指派已移除。
2. 如仍要找Portal刪除入口，先驗證切換New Browse Experience，避免再次猜選單。
3. 回到W1身分治理缺口：使用者／群組與限定範圍角色指派，先確認租戶權限及帳號條件，不能拿今日查Owner當成已完成授權實驗。
4. 後端保留未提交diff供複習；migration工具、登入授權、500故障注入、資料庫錯誤對應與冪等鍵仍未完成。

## 來源（2026-11-10查證）

- [Azure RBAC](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- [資源鎖](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/lock-resources)
- [Azure Policy](https://learn.microsoft.com/en-us/azure/governance/policy/overview)
- [內建標籤原則](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-policies)
- [資源群組刪除](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/delete-resource-group)
- [Azure區域](https://learn.microsoft.com/en-us/azure/reliability/regions-overview)
- [Amazon靜態穩定性文章](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/)
- [Google軟體工程測試章節](https://abseil.io/resources/swe-book/html/ch11.html)
- [桌面語音用量說明](https://learn.chatgpt.com/docs/pricing#how-much-does-voice-cost)

[共用進度](../curriculum/PROGRESS.md)｜[八週課綱](../curriculum/SYLLABUS.md)
