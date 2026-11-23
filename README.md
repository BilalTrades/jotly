# jotly
<img width="1365" height="720" alt="image" src="https://github.com/user-attachments/assets/3ed174cb-17e4-4689-9a40-7e91c94d3da4" />

**By BilalTrades [@bilal_tradess](https://www.instagram.com/bilal_tradess/)** · 100% free · Offline-first trading journal for Windows 10 & 11.

An original React + TypeScript + Tailwind interface inside **Tauri v2**, with a Rust persistence and compressed-backup backend. No Electron, hosted database, analytics SDK, subscription, sign-in or runtime CDN. UI icons, charts, layouts and connectors are original code; framework dependencies and locally bundled open-source fonts retain their own licenses.

## Delivery status

- Frontend TypeScript and production build verified in the supplied Linux workspace.
- Five parser/default-data validation tests pass (`npm test`).
- Browser smoke test passes: dashboard, manual trade, reload persistence, CSV import, weekly reflection, light theme, and strategy navigation, without runtime errors.
- **Windows Rust compilation, installers, MQL compilation and live-terminal reconciliation have not been verified here.** This workspace has no Rust toolchain or Windows SDK. The supplied files are a source delivery, not a signed or release-certified Windows executable.
- The 3–20 MB bundle and <15 MB executable sizes are targets, not measured results. Release optimization is configured. WebView2 is not bundled; an offline fixed runtime would substantially exceed that size target.

## Windows prerequisites

1. Windows 10/11 x64, Git, and **Node.js LTS** (22 recommended).
2. Rust stable MSVC toolchain through rustup (`https://rustup.rs`). Restart your terminal after installation.
3. Visual Studio 2022 Build Tools: **Desktop development with C++**, MSVC x64/x86 tools and Windows 11 SDK. For MSI packaging, enable the Windows **VBSCRIPT** optional feature if WiX requires it.
4. Microsoft Edge **WebView2 Evergreen Runtime**. Normally installed on modern Windows; preinstall it on offline machines.

In PowerShell from the extracted project directory:

```powershell
npm ci
npm test
npm run desktop          # native Tauri development window
npm run build            # production frontend + native bundles
npm run portable         # dist-portable/jotly.exe
npm run package:windows  # NSIS + MSI installers
```

Build outputs:

- `src-tauri/target/release/jotly.exe`
- `dist-portable/jotly.exe` after `npm run portable`
- `src-tauri/target/release/bundle/nsis/*.exe`
- `src-tauri/target/release/bundle/msi/*.msi`

The portable executable requires WebView2 and stores data in the same per-user data directory as installed builds, not beside the executable. Installers are unsigned: Windows may show SmartScreen warnings. Do not publish as trusted/signed without your own signing and QA. Installer setup may download WebView2 if missing; **the journal itself makes no network requests**. For fully disconnected installation, preinstall WebView2 before running an installer.

A manually triggered `.github/workflows/windows.yml` workflow is included to build downloadable Windows artifacts if you put this source in a GitHub repository. That workflow has not been run here.

## Browser preview

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run frontend:build
```

The preview uses this browser origin's **localStorage**, not Windows filesystem storage. It has the same UI and journal features, gzip backup download/upload, but native folders and dialogs require Tauri. Browser storage has a small quota: large screenshots can exhaust it. Desktop journal files avoid that particular quota. Save failures are shown in the UI; keep regular backups. Browser and desktop journals do not automatically synchronize.

## Getting started

1. Open **Settings → Trading accounts**. Edit the initial paper account or create Eval, Funded, Live or Paper accounts with starting balance, currency and default risk percentage.
2. Switch account from the sidebar. All Accounts aggregates records. Mixed-currency totals have **no FX conversion** and are explicitly warned against; use a single-currency account for meaningful financial metrics.
3. Add a trade manually, or import CSV. No fictional trades are seeded.
4. Open a trade to journal risk, strategy, checklists, session, emotions, rating, notes, and six screenshots. Mark reviewed explicitly. Imported trades retain zero risk until you journal it; unknown R is excluded from Average R.
5. Review emotional outcomes and missed-rule net outcomes under Reviews. Use Weekly Improvement for autosaved Monday-based reflections.

## CSV import: MatchTrader, TradeLocker, MT4, MT5

Click **Import trades**, select a destination account and broker preset, then choose a CSV. All presets use tolerant header aliases and expose a column mapper, so inspect the mapping before committing. Broker export formats vary; these are not authenticated broker API connections.

| Field | Recognized example headers |
| --- | --- |
| id | Position ID, Order ID, Ticket, Deal |
| symbol | Symbol, Instrument, Asset |
| side | Side, Type, Direction |
| qty | Volume, Lots, Quantity |
| openTime | Open Time, Open Date, Entry Time |
| closeTime | Close Time, Close Date, Exit Time |
| entry / exit | Open Price / Close Price, Entry Price / Exit Price |
| pnl | Net P&L, PnL, Profit, Net Profit |
| fee adjustments | Commission, Swap |

- MatchTrader: export position history, map Position ID, Symbol, Side, Volume, open/close times, prices, Net P&L.
- TradeLocker: export closed orders/positions, map Order/Position ID, Instrument, Side, Lots, dates, prices and PnL.
- MT4/MT5: export deal/order history using the supplied EA or a compatible CSV; map Ticket/Deal, Symbol, Type, Volume, timestamps, prices, Profit, Commission and Swap.
- Custom CSV: select your header in each dropdown. Comma or semicolon delimiters, quoted cells, quoted newlines and escaped quotes are supported. Use UTF-8 encoding.
- Required: ID, symbol, opening timestamp, closing timestamp and a numeric realized profit. Invalid dates or missing required cells are skipped with a count. Review your import totals against the broker statement.
- Profit calculation is `pnl + commission + swap`; commission/swap values are signed adjustments (normally negative costs). If your P&L is already net, leave both adjustments **Not mapped** to avoid double-counting.
- Dates: ISO 8601 with an explicit timezone is safest. `YYYY.MM.DD HH:MM:SS` is also supported. A timestamp with no offset is interpreted in the machine's local timezone. Broker server time may differ: normalize CSV timestamps before importing when needed. The table and calendar group by the stored date string; imported ISO dates are UTC.
- Deduplication: **ID + uppercase symbol + normalized close time**, across the journal. A repeated row is skipped, not merged. Distinct accounts with colliding broker IDs/symbols/times also collide; review such exports manually.
- Imported trades always begin **Unreviewed**, with **0 planned risk**. Correct strategy, risk, psychology and screenshots afterward.
- `fixtures/example-mt5.csv` provides two small import test records.

## Zero-network MT4 / MT5 sync

These are Expert Advisors exporting local files, **not broker connections**. They never place orders or send network requests. Review the source before attaching to a terminal.

### MT4

Copy `connectors/mt4/jotly_Sync.mq4` to `MQL4/Experts/`, compile using MetaEditor, and attach to a chart. Set Account History to the required history range. The EA writes closed market orders every 10 seconds to:

`<terminal data directory>\MQL4\Files\jotly\closed_trades.csv`

### MT5

Copy `connectors/mt5/jotly_Sync.mq5` to `MQL5/Experts/`, compile using MetaEditor, and attach to a chart. Output every 10 seconds:

`<terminal common data directory>\Files\jotly\closed_trades.csv`

This uses `FILE_COMMON`. Typically the common directory is `%APPDATA%\MetaQuotes\Terminal\Common`. It exports exit/exit-by deals, with weighted entry price and allocated entry commission. **Netting reversals (`DEAL_ENTRY_INOUT`), complex scale-in/out commission allocations, broker balance adjustments and non-trade charges require manual reconciliation**; the exporter is not an accounting ledger. The full-history scan prioritizes simplicity, not huge-account performance.

### Importing the local file

Choose **Import trades → Check MT4 / MT5 local folder**. Select the folder containing `closed_trades.csv`; the app reads it into the mapper for review and import. Repeat to check new exports; deduplication prevents repeated rows. This is user-triggered polling; **no automatic watcher is installed**. If the terminal is rewriting the file, wait a moment and retry. MT scripts require terminal-side compilation/testing on your machine.

## Storage, backups and privacy

Desktop data directory is strictly:

```text
%LOCALAPPDATA%\jotly\data\
  journal.json
  journal.previous.json
```

`save_journal_data` writes a flushed temporary file, preserves the previous journal, and replaces the destination under a mutex. Files are plain JSON, **not encrypted**. Avoid simultaneous journal instances. If the current file becomes corrupt, close the app, preserve both files, and recover from the previous file or a `.jotly` backup. Loading errors do not silently replace your journal with a blank one.

**Settings → Export .jotly backup** creates gzip-compressed JSON containing the entire journal and embedded screenshots. Restore validates the structure and asks before replacing all data; it is not a merge. Backups are **not encrypted**. Keep an extra copy on media you control. Restore supports at most 256 MB uncompressed on desktop. Native file dialogs restrict filesystem operations to user-selected backup/CSV paths. No general frontend filesystem permission is granted.

Screenshots accept up to six images per trade or weekly reflection, at most 5 MB per image. Use upload or focus the screenshot area and Ctrl+V. Images are embedded as data URLs; they increase journal and backup size. No screenshot hosting.

Creator social buttons intentionally open the system browser. Those external sites have their own privacy policies. Handles are based on the provided `Bilaltrades` name and have not been ownership-verified; edit links and the capability allowlist together if necessary.

## Analytics definitions

- Net P&L: sum of closed trades' realized net profit in the selected timeframe/account.
- Win rate: strictly positive trades / all closed trades (breakevens are in the denominator).
- Profit factor: positive gross outcomes / absolute negative outcomes; infinity with wins and no losses.
- Average R: mean of net P&L / planned risk, excluding zero/unknown risk.
- Avg Win / Loss: separate average strictly winning and losing outcomes.
- Equity curve: cumulative realized net P&L, **not mark-to-market account equity**, starting at zero.
- Rule compliance: current assigned strategy rules checked / assigned rules. Editing/deleting a strategy changes the rule context for older trades; do not change rule meanings after using a playbook if you need consistent historical interpretation.
- Missed-rule and emotion results show associated P&L, not proof of causation.

## Tests & project map

```sh
npm test
npm run frontend:build
npx playwright install --with-deps chromium
# start npm run dev in another terminal, then:
node tests/smoke.mjs
```

`src/types.ts` — domain model. `src/lib/core.ts` — defaults, CSV parser, mapper, deduplication, validation. `src/lib/storage.ts` — Tauri/browser persistence and backups. `src/App.tsx` — account-aware screens, original SVG analytics, inspectors and editors. `src/components/Icon.tsx` — original line icons. `src/style.css` — responsive slate/amber design with local fonts and theme tokens. `src-tauri/` — native commands, release config and scoped capabilities. `connectors/` — local-only MQL exporters. `.github/workflows/` — optional Windows artifact build.

Before public release: run Windows builds, test dialogs/restore/data recovery, compile both EAs, reconcile real broker exports including partial exits/timezones, measure installer sizes, and optionally code-sign installers.
