# 資料依據與查證

查證日 2026-11-09。優先使用官方文件與官方實驗，社群心得只作背景，課綱、權重與驗收不依賴題庫或傳聞。

## AZ-104 版本查核

研究子代理及主教練交叉核對 Microsoft 官方頁面。證照頁列 2026-04-17 更新，study guide 官方搜尋索引可讀到 2026-04-17 生效的完整細項及變更表。同一網址直接讀取時曾回傳 2023-10-26 舊快照，因此保留此差異，考前重新核對。正式課程本版以已讀到的 2026 細項為基準。

目前可確認五領域權重如下。這些是考試比重，授課時間還要考慮既有能力與實驗成本。

| 領域 | 權重 | 課程主要週次 |
|---|---:|---|
| 身分與治理 | 20–25% | W1，W7～W8複驗 |
| 儲存體 | 15–20% | W2，W6還原與W7補弱 |
| 運算 | 20–25% | W4～W5 |
| 網路 | 15–20% | W3，既有Day02～03局部抵免 |
| 監控與維護 | 10–15% | W6 |

本次辨認到的更新包括 VM 主機端加密，以及 Blob／容器軟刪除的明確細項。已反映到課綱與追蹤表。完整官方清單保留於來源，不以本課程工作包取代。

- [AZ-104 官方證照與考試頁](https://learn.microsoft.com/en-us/credentials/exams/az-104/)
- [AZ-104 官方 study guide 與 change log](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104)
- [MicrosoftLearning 官方實驗索引](https://microsoftlearning.github.io/AZ-104-MicrosoftAzureAdministrator/)
- [官方身分管理實驗](https://microsoftlearning.github.io/AZ-104-MicrosoftAzureAdministrator/Instructions/Labs/LAB_01-Manage_Entra_ID_Identities.html)
- [官方部署範本實驗](https://microsoftlearning.github.io/AZ-104-MicrosoftAzureAdministrator/Instructions/Labs/LAB_03b-Manage_Azure_Resources_by_Using_ARM_Templates.html)
- [官方考試準備與介面體驗入口](https://learn.microsoft.com/en-us/credentials/certifications/prepare-exam)
- [官方考試體驗與文件查閱規則](https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience)

租戶授權、訂閱、區域、配額和計費會影響實驗可做程度。開始每個實驗前重新確認，替代示範／閱讀／情境題與實際操作分開記錄。

## 全端課程能力依據

這裡的能力組合是主教練與審核者為本學員設計的結業標準。以下資料支持各項工程做法，並不存在通用的「全端官方畢業標準」。

| 來源 | 在課程中的用途 |
|---|---|
| [node-postgres 查詢](https://node-postgres.com/features/queries) | 參數化查詢與輸入邊界 |
| [node-postgres 交易](https://node-postgres.com/features/transactions) | 同一條連線的交易、回滾與歸還 |
| [node-postgres 連線池](https://node-postgres.com/features/pooling) | 借還生命週期與連線洩漏 |
| [PostgreSQL 官方教學](https://www.postgresql.org/docs/current/tutorial.html) | 關聯模型、SQL與交易的概念順序 |
| [OWASP 授權指南](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 逐請求資料授權與拒絕測試 |
| [Node.js 測試執行器](https://nodejs.org/api/test.html) | 自動驗證的能力基準，具體工具可沿用熟悉工具 |
| [Docker 映像建置建議](https://docs.docker.com/build/building/best-practices/) | 多階段建置、可信來源、最小依賴與版本 |

實務案例來自唯讀抽樣的 react-flow 與 gallery。前者把節點與邊轉成可儲存資料，適合討論服務端結構驗證。後者儲存整份展覽配置，適合討論多分頁覆寫、資料所有權與檔案生命週期。八週內以記帳小專案驗證能力，既有作品作比較案例。

## Agent開發協作依據

2026-11-09使用者確認將agent納入全端開發流程。專項訓練採6小時分布於W1～W8，搭配每週既有任務，練習定義範圍、提供背景、計畫、實作、差異審查、驗證與交接。課程採用的週次與時數是主教練的教學設計。

- [OpenAI開發工作流程指南](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex) 支持明確範圍、可觀察的完成條件、工作階段與驗證證據。
- [OpenAI子代理說明](https://learn.chatgpt.com/docs/agent-configuration/subagents) 用於可獨立分工的研究、實作與審查。初期先熟悉單一agent，之後再練交接與整合。

## 後續產品AI功能參考

原先記帳分類建議移入結業後選修。下列資料保留作為後續產品整合與評估的參考。

- [OpenAI 結構化輸出](https://developers.openai.com/api/docs/guides/structured-outputs) 支持定義與驗證模型輸出。
- [OpenAI 評估方法](https://developers.openai.com/api/docs/guides/evaluation-best-practices) 支持先定義案例、可重跑評估和分析錯誤。
- [OpenAI 正式環境建議](https://developers.openai.com/api/docs/guides/production-best-practices) 作為憑證、成本與部署檢查的參考。

研究者提醒官方評估平台正在變動，因此課程使用本地測試案例與可重跑程式表達評估方法，避免綁定特定平台流程。實作前再核對當期模型、SDK（Software Development Kit，軟體開發套件）、價格與資料政策。模型輸出需要使用者確認，資料庫權限與交易仍由一般後端處理。

## 計畫的假設與限制

- 每週至少30小時由使用者確認，240小時為原始八週期間名目預算，既有時數未知。
- 審核者確認日期與時數加總，但認為Azure 92小時仍緊湊，代表性實驗與逐項概念覆蓋需要分層。
- 前端作品能支持提高教學起點。個別功能作者和獨立能力由短期診斷補證據。
- 全端結業包含agent協作判斷，AZ-104準備另行驗收。產品內AI功能延後，證照與工作中的所有能力不能互相推定。
- 原始完整八週逐日規劃未取得，本課綱是重整後的正式基準。

## 再查證規則

每次引用會變動的文件，記錄查證日與版本。研究者在該週開始前確認新增或移除考點，將差異交給主教練與審核者決定排程。部署指令、區域規格、價格、身分授權與考試規則在使用前重新驗證。穩定原理預先備妥，課堂查證聚焦實際尚未確定的細節。

## 2026-11-09 授課來源透明度修正

使用者指出課堂無法辨識內容來源。既有來源清單不等於每次講解都有逐項查證；聊天中的情境、教學順序與專案錯誤格式由主教練設計，不能標成官方標準。

本次重新查閱：

| 主題 | 可追溯資料 | 性質與限制 |
|---|---|---|
| 交易 | https://www.postgresql.org/docs/17/tutorial-transactions.html | PostgreSQL 17官方行為；交易不等於自動解決所有併發問題 |
| 主鍵、外鍵、CHECK | https://www.postgresql.org/docs/17/ddl-constraints.html | PostgreSQL 17官方規則 |
| Migration流程 | https://martinfowler.com/articles/evodb.html | Sadalage與Fowler的工程實務文章，本次補入；具體檔名、追蹤表與交易支援取決於工具 |
| 測試設計 | https://abseil.io/resources/swe-book/html/ch11.html | Software Engineering at Google第11章，本次補入作工程閱讀主線；依課程規模取捨 |
| Node測試工具 | https://nodejs.org/api/test.html | 本次取得v26文件，專案實跑Node22；不可將新版專有功能直接套用，v22文件擷取本次失敗 |

後續每個單元開頭標明課綱能力編號、目標、主要來源章節與版本，結尾區分討論、實作與驗收。官方行為、工程建議、課程自訂慣例分開標明。補查來源只表示現在完成核對，不宣稱先前講解逐句出自該來源。

目前error.code／message／field為專案自訂回應契約；測試是否共用常數是取捨，不能說成禁止共用。應避免測試只重複讀取實作設定而失去獨立的需求驗證。
