# Screenshots (Playwright MCP + test runner)

## Cursor: Playwright MCP (snapshots)

This repo ships a **project-level MCP config**: [`.cursor/mcp.json`](../.cursor/mcp.json). It installs **official** `@playwright/mcp` and pins **temporary outputs** (MCP screenshots, related artifacts) under **`.playwright-mcp/`** at the workspace root (`--output-dir` + `PLAYWRIGHT_MCP_OUTPUT_DIR`). That directory is **gitignored** — copy anything you want in the README into [`docs/screenshots/`](./) manually.

1. Open this folder as the Cursor workspace (so `${workspaceFolder}` resolves here).
2. **Reload MCP / restart Cursor** after pulling so the new `.cursor/mcp.json` loads.
3. Run the app: `pnpm db:migrate`, then `pnpm dev` → browse `http://127.0.0.1:3000`.
4. In chat, ask the agent to capture via Playwright MCP; use **short filenames only** so files land under `.playwright-mcp/` (e.g. `home.png`). Avoid absolute paths elsewhere if you want the output-dir rule to apply.
5. Reference: [Playwright MCP — configuration](https://github.com/microsoft/playwright-mcp#configuration) (`--output-dir` / `PLAYWRIGHT_MCP_OUTPUT_DIR`).

> **Note:** Cursor does not provide a CLI used here for MCP registration; committing `.cursor/mcp.json` is the supported **project install**.

---

## Cursor: Playwright MCP（互動截圖）

專案已內含 [`.cursor/mcp.json`](../.cursor/mcp.json)：會執行 `npx @playwright/mcp@latest`，並將 **Playwright MCP 產生的臨時截圖／輸出** 寫入工作區根目錄 **`.playwright-mcp/`**（已在 `.gitignore`）。要上 README 請自行複製到 `docs/screenshots/`。

請以本資料夾為 Cursor **工作區**根目錄，並在更新後 **重載 MCP 或重啟 Cursor**。

---

## Automated: `@playwright/test`（可提交到 Git）

靜態頁截圖由 `@playwright/test` 產出（**非 MCP**），路徑在 `docs/screenshots/`（可提交）：

```bash
pnpm install
pnpm exec playwright install chromium
pnpm screenshots
```

[`e2e/screenshots.spec.ts`](../e2e/screenshots.spec.ts) → `01-home.png`、`03-success.png`。

| File | Source / 來源 |
|------|---------------|
| `01-home.png` | `pnpm screenshots`，或 MCP 存於 `.playwright-mcp/` 後再複製 |
| `02-stripe-checkout.png` | MCP / manual；預設先落 `.playwright-mcp/` |
| `03-success.png` | 同上 / 測試輸出 |
| `04-prisma-studio.png` | Manual：`pnpm db:studio` |
| `05-stripe-cli.png` | Manual：`stripe listen …` |
