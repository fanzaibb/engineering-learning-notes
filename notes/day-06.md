---
date: 2026-11-11
agent: [chatgpt, claude]
topics: [be-12, be-14, be-16, be-18, be-19, be-20, be-24, be-29]
---

# Day 06｜結構遷移、Azure 配額與自寫 migration 執行器

日期：2026-11-11（Asia/Taipei），W1 最後一天。上午由 ChatGPT 授課，從手動改結構到用 node-pg-migrate 執行遷移，並讓單筆查詢與整合測試接上 `note`；下午由 Claude 授課，查 Azure 配額、升級開發資料庫、學員自寫 migration 執行器並清理練習資料庫。實際時數待登錄（後端／Azure／複習）。

| 狀態 | 內容 |
|---|---|
| 已操作／實作 | 手動 `ALTER TABLE`、`--dry-run`／`--fake`、工具遷移與重跑、單筆查詢回傳 `note`、測試套用遷移（13 項通過）；查東亞配額、開發資料庫套用 migration、README 修正、自寫 migration 執行器、清理練習資料庫 |
| 已討論 | vCPU 與規格命名、x86-64／ARM64、託管磁碟、追蹤表、基準線、擴張再收縮、API 契約與資料庫分離、自動提交與交易、結束碼 |
| 未做 | 有文字備註的自動測試、備註的新增與更新端點、執行器失敗回滾演練（學員選擇略過）、預算通知確認 |

## 上午｜ChatGPT 授課：手動改結構到工具執行遷移

**先手動看懂欄位怎麼加，再換一個仍是舊結構的資料庫，由遷移工具執行檔案並自動留下版本紀錄。** 提前練習 W2 的 B05（遷移與重建）與 B07（整合測試），學員依指引操作。

### 1. 從 Day 05 的測試接續

**更新回傳 200 後，再查同一筆資料，才能驗證新值真的存進去。** 午餐由 120 元改成 150 元，第二次查詢要比對同一個 ID（Identifier，識別碼）的金額。可查單筆，也可查列表後用 ID 定位。手動看查詢結果是驗證，自動測試則用 `assert.equal` 等斷言在實際值與預期不一致時讓測試失敗。教練在隔離環境重跑 `npm test`，13 項（含父測試）通過，臨時環境已清理。

### 2. 手動理解改結構

**`ALTER TABLE` 讓原本的 `expenses` 表多一個可選填的備註欄位。** 學員先用 `schema.sql` 在練習資料庫建表，再用 `seed.sql` 加入 `Demo` 使用者。空資料庫的第一位使用者自動取得 ID 1，午餐記帳的 `user_id = 1` 透過外鍵指向他。終端機裡 `< db/seed.sql` 將檔案交給 PostgreSQL 命令列工具 `psql` 執行。`INSERT 0 1` 的最後一個數字是筆數，中間的 0 是舊版 OID（Object Identifier，物件識別碼）回報欄位的保留值。 [PostgreSQL 17 INSERT](https://www.postgresql.org/docs/17/sql-insert.html#SQL-INSERT-OUTPUTS)

在 `expense_day06_practice` 先存午餐 120 元，再執行下列指令。

```sql
ALTER TABLE expenses ADD COLUMN note text;
```

加欄位後另發一次查詢，畫面查到 `id = 1`、`amount_cents = 12000`、分類「午餐」、`note IS NULL = t`。金額以分儲存，`t` 表示查詢條件為真。學員回報也新增了有備註的晚餐。之後在 `expense_day06_migration` 以 `psql` 直接執行同一份 SQL 檔，終端機查回舊午餐和新晚餐 150 元，晚餐備註為「跟同事聚餐」。

多次查資料時可在 VS Code 終端機先用 `docker exec -it expense-postgres psql -U expense_dev -d expense_day06_practice` 連線一次，看到資料庫提示字元後直接輸入 SQL（Structured Query Language，結構化查詢語言），用 `\q` 退出。（下午清理時發現的殘留 psql 連線，就是這種互動視窗沒有退出。）

### 3. 上午遇到的錯誤與修正

- **查詢報 `column "note" does not exist`。** 檔案實際名稱是 `001_add_exoense_note.sql`，和指令中的 `001_add_expense_note.sql` 不一致。修正檔名後重跑原檔，查回午餐 120 元且備註是 `NULL`。
- **預覽也顯示 `Migrations complete!`。** `--dry-run` 列出準備執行的 `ALTER TABLE` 和寫入 `pgmigrations` 的 SQL。已安裝的版本可能先建立紀錄表，學員實際查到 `(0 rows)`，證明這次預覽沒有登錄 `001`。
- **已手動改過的庫要怎麼接管？** `--fake` 只補紀錄。若遷移預期 `note text`，實際卻是 `note integer`，工具仍會信任紀錄並跳過。需要先核對型別、可否為 `NULL`、預設值及約束。課堂在已手動修改的 `expense_day06_migration` 跑過 `--fake`，屬接管情境。
- **教學順序修正。** 學員指出第一次學遷移應在理解改結構之後，換一個仍是舊結構的資料庫完整跑正常流程。原安排沿用已手動修改的資料庫，才額外引入補紀錄。之後採兩段練習，終端機指令交給學員執行，說明貼在哪裡和預期輸出。

### 4. 由工具正式執行遷移

**檔案定義變更，工具執行後會在該資料庫的 `pgmigrations` 留下紀錄。** 使用 Node.js 22.16.0、PostgreSQL 17 與專案安裝的 `node-pg-migrate` 9.0.0。檔案 `db/migrations/001_add_expense_note.sql` 的升級段新增 `note text`，撤回段刪除該欄位，也會移除其中的備註資料。

1. 建立新的 `expense_day06_tool`，依序套用 `db/schema.sql` 和 `db/seed.sql`，先存一筆午餐 120 元。這時的結構仍未加入 `note`。
2. 在專案終端機執行 `PGDATABASE=expense_day06_tool npm run migrate up`。專案指令載入 `.env` 的連線設定，前綴指定這次的練習資料庫。
3. 用 `\d expenses` 查欄位型別，再查午餐的 ID、金額、分類與 `note IS NULL`，最後查 `SELECT name, run_on FROM pgmigrations;`。預期舊資料保留，`pgmigrations` 有一筆 `001_add_expense_note`。
4. 重跑同一條 `migrate up`，再查一次紀錄。驗收條件是工具跳過 `001`，紀錄仍只有一筆，時間與第一次相同。學員回報已完成最後查詢，課堂未貼出兩次時間及重跑原始輸出。

學員在工具升級過的 `expense_day06_tool` 另存一筆晚餐，並回報獨立查詢可讀回「跟同事聚餐」，同時查到舊午餐 120 元。

學員查得 PostgreSQL 工作階段時區為 `Etc/UTC`。遷移紀錄欄位 `run_on` 使用不含時區的時間戳，若遷移連線同樣採 UTC（Coordinated Universal Time，世界協調時間），顯示值加八小時是台灣時間。

### 5. 讓單筆查詢回傳備註

**資料庫有備註之後，單筆查詢還要把它選出來，並放進回應。** 學員先在 `src/server.ts` 找到 `GET /expenses/:id` 的查詢，原本的 `SELECT` 只有 `id`、`amount_cents` 和 `category`。後面用 `sendJson` 逐欄組成 JSON（JavaScript Object Notation，JavaScript 物件表示法）。因此查詢與回應各要接一次。

1. 新增 `ExpenseDetailRow = ExpenseRow & { note: string | null }`，描述單筆查詢會讀到的欄位。舊記帳的備註允許為 `NULL`，所以回應型別也接受 `null`。
2. 單筆查詢改用 `pool.query<ExpenseDetailRow>`，並在 `SELECT` 加上 `note`。
3. 在成功回應加上 `note: expense.note`。把它與原本的金額轉換 `expense.amount_cents / 100` 一起對照，就能看清楚哪些欄位直接回傳，哪些欄位由後端轉換。

學員用練習庫啟動後端，並從另一個終端機呼叫兩個端點。

```bash
PGDATABASE=expense_day06_tool PORT=3106 node --env-file=.env --import tsx src/server.ts
curl -i http://127.0.0.1:3106/expenses/1
curl -i http://127.0.0.1:3106/expenses/2
```

| 單筆查詢 | 學員確認的結果 |
|---|---|
| 午餐 | 回傳成功，金額 120 元，`note: null` |
| 晚餐 | 回傳成功，金額 150 元，`note: "跟同事聚餐"` |

本次實作範圍是單筆讀取。晚餐備註先透過資料庫新增，備註的新增與更新端點仍待實作。

### 6. 讓整合測試跟著遷移

**測試每次都從舊版建表檔建立臨時庫，因此啟動後端前要套用同一份遷移。** 在 `test/run-integration.cjs` 先插入原有測試資料，再以 `execFileSync` 執行 `npm run migrate up`，讓後端啟動前表結構就已更新。傳入的 `PGDATABASE` 是本次臨時庫的名稱，清空 `DATABASE_URL` 讓工具採用個別的 PostgreSQL 連線設定。

在 `test/errors.test.cjs` 的完整記帳流程中，兩個單筆查詢斷言都加上 `note: null`（新增後第一次查詢 120 元、更新後再查 150 元）。VS Code 終端機顯示 `npm test` **13 項通過、0 項失敗**，並顯示「已清理本次測試資料庫與後端」。有文字備註的單筆回應已手動驗證，自動測試仍待補。成果提交為 expense-api 的 `a4d0a9c`。

## 下午｜Claude 授課：配額、概念複驗與自寫執行器

下午 13:41–15:43 由 Claude 授課，從這天起 Claude 為主要授課教練。

### 7. Azure 配額｜東亞同時最多 4 顆 vCPU

**一句話結論：開 VM 要同時通過「區域總量」和「系列」兩層上限，免費帳戶在東亞兩層都是 4 顆 vCPU。**

`az vm list-usage --location eastasia -o table` 的重點：

| 項目 | 用量／上限 | 意思 |
|---|---|---|
| Total Regional vCPUs | 0／4 | 東亞所有 VM 加起來最多 4 顆 |
| Standard Bsv2 等 B 系列 | 0／4 | 單一系列最多 4 顆 |
| DCS、H、MS 等系列 | 0／0 | 免費帳戶不能開，不是「還沒用」 |

配額每個區域各自計算。W2 若共用實驗機用 2 vCPU，再開擴展集 2 台同規格，2＋2＋2＝6 超過上限會被拒絕。調整方法：擴展集改用 1 vCPU 規格，或先**解除配置**（deallocate）共用機。在 VM 裡關機只是「停止」，Azure 仍保留主機；解除配置才釋放資源，解除後用 `list-usage` 確認用量真的下降。

### 8. VM 規格怎麼讀｜名字就是一串編碼

**一句話結論：`Standard_D4as_v5` 讀作 D 系列一般用途、4 顆 vCPU、AMD 處理器、支援進階 SSD、第 5 代。**

- vCPU（virtual CPU，虛擬 CPU）是從實體主機切出來的運算單位。
- 系列字母：B 可突增（靠 CPU 點數，適合平常閒、偶爾忙的學習機）、D 一般用途、E 記憶體優化、F 運算優化、N 有 GPU。
- 附加特性：`a` AMD、`p` ARM64 處理器、`d` 附本機暫存磁碟、`l` 記憶體較少、`s` 可掛進階 SSD（Solid State Drive，固態硬碟）。
- 選規格：先看工作負載的 CPU 與記憶體，選最小跑得動的，上線看監控再調整。

**架構只有兩種**：x86-64（又稱 amd64，Intel 和 AMD 兩家都做）與 ARM64。Apple M 系列 Mac 是 ARM64，預設 `docker build` 出的映像是 arm64，丟到 x86 的雲端主機常見 `exec format error`，W4 做 Dockerfile 時用 `--platform linux/amd64` 處理。

**託管磁碟不是插在主機上的硬碟**，是透過網路掛上的磁碟，分標準 HDD（Hard Disk Drive，硬碟）、標準 SSD、進階 SSD 等級。`s` 代表該規格的 VM 有足夠傳輸能力掛進階 SSD，像筆電要有快速連接埠才能發揮高速外接硬碟。

### 9. Migration 概念｜用追蹤表讓每個環境走到同一個狀態

**一句話結論：工具在資料庫裡記下「哪幾份檔案套用過」，每次只依序跑沒紀錄的，所以新舊環境都能走到同一個結構。**

- 已有資料時用 `ALTER TABLE` 改結構；重跑建表會清掉資料。
- 同一份 migration 重複執行會失敗（例如欄位已存在），所以需要追蹤表。node-pg-migrate 的追蹤表叫 `pgmigrations`。
- **已套用的檔案不修改。** 工具只看追蹤表、不重讀檔案內容，改了已套用的檔案會被跳過，結果不同環境的結構不一致。要改就新增下一份，例如學員寫的：

```sql
-- 003_rename_expense_note_to_memo.sql
ALTER TABLE expenses RENAME COLUMN note TO memo;
```

- **正式環境的改名要拆步驟（擴張再收縮）**：先新增 `memo` 並複製資料 → 程式改用 `memo` → 確認舊版後端下線後才刪 `note`。每一步之間是一次部署。
- **資料庫欄位名和 API 欄位名是兩件事。** 前端只依賴 API 契約；資料庫改名但 API 仍回傳 `note`，前端不用改。API 真的要改時，新舊欄位並存一段時間，並用請求紀錄判斷舊欄位是否還有人用，而不是假設所有客戶端都更新了。

### 10. 專案現況｜schema.sql 是凍結的基準線

**一句話結論：目前完整結構＝ `schema.sql` ＋依序套用 `db/migrations`，把新欄位寫回 schema.sql 會讓 migration 因欄位重複而失敗。**

上午的成果見第 4～6 節。測試流程的順序是 schema → seed → `migrate up`，不能反：還沒建表就跑 migration 會找不到 `expenses`。

下午發現與修正：

| 問題 | 處理 |
|---|---|
| 上午的手動與工具練習都在練習資料庫，開發資料庫 `expense_app` 從未升級：沒有 `pgmigrations`、沒有 `note`，但程式已查詢 `note`，單筆查詢會出錯 | 學員執行 `npm run migrate -- up`，確認追蹤表記錄 001、3 筆記帳保留、`GET /expenses/1` 回 200 含 `"note": null` |
| `db/README.md` 建新資料庫的步驟少了 migrate | 補上 `PGDATABASE=expense_sandbox npm run migrate -- up` |
| README 把 schema.sql 描述成「目前完整的建表方式」，會誘導 agent 去更新它 | 改為凍結基準線的說法 |
| 每次啟動要打一長串指令 | `package.json` 加 `npm run dev` |

**一個伺服器可以有多個資料庫。** `expense-postgres` 容器裡有 `expense_app`、測試的臨時資料庫、練習資料庫等，`.env` 的 `PGDATABASE` 決定連哪一個。指令前加 `PGDATABASE=...` 會蓋過 `.env`，因為 Node 讀 `.env` 時已存在的環境變數優先。

兩個小觀察：`run_on` 與 HTTP `Date` 標頭都是 UTC（Coordinated Universal Time，世界協調時間）或 GMT（Greenwich Mean Time，格林威治時間），比台灣慢 8 小時；PostgreSQL 的自動編號刪除後不回補，id 1、2、4 沒有 3 是正常的。

### 11. 自寫 migration 執行器｜把機制寫成程式

**一句話結論：migration 工具的核心只有四步，學員依提示自己寫出 `practice/mini-migrate.mjs` 並在 `expense_mini` 驗證。**

| 步驟 | 寫法 | 學到什麼 |
|---|---|---|
| 讀檔 | `readdir` → `filter(.sql)` → `sort()` | `readdir` 不保證順序，要排序；字串排序要搭配補零檔名 |
| 追蹤表 | `CREATE TABLE IF NOT EXISTS mini_migrations (name text PRIMARY KEY, run_on timestamptz DEFAULT now() NOT NULL)` | 主鍵讓資料庫擋重複紀錄，並自動建索引；`IF NOT EXISTS` 讓重跑不出錯（冪等） |
| 比對 | 參數化查詢 `WHERE name = ANY($1)`，用 `Set` 找出待執行 | 盲點：已套用但檔案被刪的紀錄看不到 |
| 套用 | 只取 `-- Down Migration` 前的 Up 段，`BEGIN` → 改結構 → 寫紀錄 → `COMMIT`，出錯 `ROLLBACK` | 見下方 |

**為什麼只取 Up 段**：`--` 對資料庫只是註解，整份送出會先加 `note` 再刪掉，追蹤表卻記成已套用。

**為什麼要交易**：PostgreSQL 預設每條指令成功就立刻生效（自動提交），沒開交易就沒有 rollback 可言。改結構成功、寫紀錄前程式當掉，會留下「欄位有、紀錄沒有」，下次永遠卡在欄位已存在。PostgreSQL 連 `ALTER TABLE` 都能在交易中退回；MySQL 的結構變更大多會自動提交，之後做 MySQL 版要注意。

**結束碼是程式對外的契約**：0 成功、非 0 失敗，用 `echo $?` 查看。`process.exit(1)` 立刻結束；`process.exitCode = 1` 搭配 `break` 會讓程式照常收尾、關閉連線後回報失敗。`&&`、測試的 `execFileSync`、CI 都靠結束碼判斷是否繼續。成功卻回 1 會擋下後續步驟；失敗卻回 0 則把問題藏起來。

驗證：套用後 `\d expenses` 有 `note`、`mini_migrations` 一筆；重跑顯示「沒有待執行的遷移檔案」，結束碼 0。失敗回滾未演練。node-pg-migrate 另外用諮詢鎖（`--lock`，預設開啟）避免兩個人同時執行。

### 12. 清理｜用系統紀錄找出誰還連著

**一句話結論：`dropdb` 說有其他連線時，查 `pg_stat_activity` 看是誰，再決定怎麼關，不靠猜。**

上午留下 `expense_day06_migration`、`expense_day06_practice`、`expense_day06_tool` 三個練習資料庫。刪除 `expense_day06_practice` 失敗，查詢結果是一個 `psql`、狀態 `idle`、開始於 02:43 UTC（台灣 10:43）、`client_addr` 空白（在容器內連線）、最後一句是新增帶 `note` 的記帳，判斷為上午某個終端機分頁還開著 psql。處理後三個都刪除。

## 教練修正與教學調整

- 上午：第一次學遷移應先理解改結構，再換舊結構資料庫跑完整流程；原本沿用已手動修改的資料庫，才額外引入 `--fake`。之後採兩段練習。（ChatGPT）
- 下午：開課時沒有先讀 expense-api 的提交紀錄，重教了上午已完成的 migration。之後每堂開課先檢查課程專案的 git 狀態。（Claude）
- 下午：引用 node-pg-migrate 網頁說明的 `status` 指令，但專案安裝的 9.x 沒有這個指令。之後先核對實際版本。（Claude）
- 上午的手動與工具練習都在練習資料庫進行，開發資料庫沒有一起升級，造成程式與 `expense_app` 結構不一致。已寫入 v1.4 的 agent 工作規則：結構變更只用 migration，練習資源當堂清理。

## 下次入口

1. 把晚餐備註加進自動測試：在測試資料庫套用遷移後準備一筆有備註的資料，呼叫單筆查詢，斷言回傳文字相同。
2. 確認 `practice/mini-migrate.mjs` 與 `db/README.md` 是否提交、`expense_mini` 是否刪除。
3. W2 Linux 虛擬機器前先估價、確認預算通知，依 4 vCPU 上限選規格。
4. 決定 `note` 是否進入列表與新增／修改的契約；之後安排一次無逐步提示的重建與升級。

## 來源

- [node-pg-migrate CLI](https://salsita.github.io/node-pg-migrate/cli)（2026-11-11 查閱；以專案安裝版本的 `--help` 為準）
- [PostgreSQL 17：INSERT 回報格式](https://www.postgresql.org/docs/17/sql-insert.html#SQL-INSERT-OUTPUTS)
- [PostgreSQL 17：交易](https://www.postgresql.org/docs/17/tutorial-transactions.html)
- [Azure 免費帳戶常見問題](https://azure.microsoft.com/free/free-account-faq)
- VM 規格命名以 Microsoft 官方「Azure VM 大小命名慣例」為準，本筆記列的是常見部分，尚未逐字核對。

[共用進度](../curriculum/PROGRESS.md)｜[八週課綱](../curriculum/SYLLABUS.md)
