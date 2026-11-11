# 知識山域網站

內容全部來自倉庫根目錄的 `knowledge/`、`notes/` 與 `curriculum/PROGRESS.md`，網站不另存內容。規格見 `docs/knowledge-site-guide.md`。

```bash
cd site
npm install
npm run dev      # 本機開發 http://localhost:5173
npm run check    # 內容檢查（建置前自動執行，錯誤會中止）
npm run build    # 檢查 → 型別檢查 → 輸出到 site/dist
```

路由使用 hash（`#/k/be-08`），部署到 GitHub Pages 等靜態主機不需額外設定。
