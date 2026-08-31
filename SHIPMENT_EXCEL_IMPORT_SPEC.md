# Spec: Import "Report Jadwal Kapal (Shipnet)" Excel into the Ship tab

Self-contained brief — paste this into another Claude Code session to implement (e.g. as an
automated scheduled task, similar to the existing Jakarta-schedule checker).

## Goal

Take the Shipnet-exported Excel report ("Report Jadwal Kapal (Shipnet).xlsx") and publish its
"Belum Sampai" (not yet arrived) rows into the **Keluarga Sultan** team app's Ship tab, so the
team sees an up-to-date shipment recap without manual entry.

## Source file structure

Single sheet named `Report Jadwal Kapal (Shipnet)`. Row 1 is a title, **row 2 is the header**,
data starts row 3. Columns (0-indexed) in row 2:

| Idx | Header | Notes |
|---|---|---|
| 0 | No Order | |
| 1 | No SO | |
| 2 | Customer Site Ship | distributor/site name |
| 3 | FOD Date | not used |
| 4 | Region | not used |
| 5 | Expedition | freight forwarder |
| 6 | Shipping Lines | carrier name |
| 7 | Container Size | e.g. "20 FCL", "40 HC FCL" |
| 8 | Vessel | vessel/voyage name — this is the grouping key |
| 9 | ETD Port of Loading | **Excel serial date** |
| 10 | ETA Port of Dooring | **Excel serial date** |
| 11 | Tanggal Bongkar | usually blank |
| 12 | Status Bongkar | `"Belum Sampai"` or `"Sudah Sampai"` |

**Excel serial → ISO date:** `new Date(Math.round((serial-25569)*86400*1000)).toISOString().slice(0,10)`

**Filter:** only rows where column 12 (`Status Bongkar`) === `"Belum Sampai"`. (206 of 296 rows
in the last file were already `"Sudah Sampai"` and should be skipped — the team doesn't need
those re-surfaced.)

**Group by Vessel** (column 8, trimmed). Within one vessel, ETD/ETA/Expedition/Shipping Line are
consistent across rows in practice — Container Size *can* vary row-to-row (seen once). So: store
ETD/ETA/Expedition/Shipping Line once per vessel group, but keep Container Size **per line item**
along with Customer Site and No SO.

## Target: Firebase Realtime Database

DB root: `https://workbook-ks-default-rtdb.asia-southeast1.firebasedatabase.app/`

Write to **`/shipments/<id>`** — one node per vessel group. Each node:

```json
{
  "id": "<same as the key>",
  "vessel": "KM.Tanto Cahaya voy 390",
  "destinations": "BORWITA CITRA PRIMA - PALOPO, PT, BORWITA CITRA PRIMA - PAREPARE, PT, ...",
  "closing": null,
  "etd": "2026-08-05",
  "eta": "2026-08-08",
  "status": "Belum Sampai",
  "lines": [
    { "site": "BORWITA CITRA PRIMA - PALOPO, PT", "soNo": "941002624",
      "expedition": "30KKLR - KARGO KONTAINER LOGISTIK INDONESIA, PT",
      "shippingLine": "TANTO", "containerSize": "40 HC FCL" }
  ],
  "creatorId": "auto",
  "createdAt": 1755000000000,
  "source": "Shipnet report import"
}
```

Field notes:
- `destinations` = comma-joined **unique** `site` values across the group's lines (shown as a summary line under the vessel name).
- `lines[].expedition` / `shippingLine` are per-line for fidelity to the source, even though currently uniform per vessel — the app's UI only reads `lines[0]` for the vessel-level expedition/shipping-line summary.
- `status` = the literal `"Belum Sampai"` string (the app's `shipmentArrived()` checks for this exact string, and also accepts `"Sudah Sampai"`).
- `creatorId: "auto"` — the app renders this as "Added by —" (no member match), which is fine.
- `id` — generate any unique string per vessel group (e.g. timestamp + random suffix). Must be unique across the whole `/shipments` collection.

**No `.indexOn` exists for `/tasks` or `/shipments`** — don't rely on `orderBy`/`equalTo` query
params against this DB; fetch the whole collection and filter/group client-side instead.

## CRITICAL — safety rules for this database

This DB holds live, shared data for a 12–13 person team (Cerita posts, tasks, photos, shipments,
etc.) editable from their phones in real time. A past incident wiped shared data by accident, so:

1. **Never delete or overwrite existing `/shipments/<id>` nodes** unless you are certain (by
   exact `id` match) that they came from a *previous run of this same import*. When in doubt,
   **always create new nodes with new ids** rather than trying to fuzzy-match against existing
   vessel names — voyage numbers differ (e.g. `TANTO CAHAYA / 389` manually added vs
   `KM.Tanto Cahaya voy 390` in the Excel are *different* shipments, not the same one).
2. **Never write to any path other than `/shipments/<new-id>`.** Do not touch `/tasks`,
   `/stories`, `/photos`, `/members`, `/standup`, `/schedreport`, `/presence`, or any existing
   `/shipments/<id>` key.
3. Each write should be a single `PUT` to one new `/shipments/<id>.json` node — i.e. purely
   additive, one item at a time. Never do a bulk multi-key `PATCH`/`PUT` at `/shipments.json`
   that could clobber siblings.
4. If re-running this import periodically (e.g. as a scheduled task), decide *and clearly
   document* whether to append fresh nodes every run (accepting some duplication across runs)
   or to track previously-imported vessel+voyage combos yourself (e.g. in a small state file) to
   avoid re-adding the same shipment. The reference implementation below always creates new
   nodes — periodic re-runs will duplicate unless you add your own dedup layer.

## Reference implementation (already run once, manually, from this session)

No Python available in that environment — used Node.js with the `xlsx` npm package instead:

```bash
npm install xlsx --no-save   # in a scratch directory
```

```js
const XLSX = require('xlsx');
const wb = XLSX.readFile('Report Jadwal Kapal (Shipnet).xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});

function excelDate(s){ if(!s) return null; const d=new Date(Math.round((s-25569)*86400*1000)); return d.toISOString().slice(0,10); }
function uid(){ return 'imp'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }

const groups={};
for(let i=2;i<rows.length;i++){
  const r=rows[i]; if(!r[0]&&!r[2]) continue;
  if(r[12]!=='Belum Sampai') continue;
  const vessel=String(r[8]).trim();
  groups[vessel]=groups[vessel]||{vessel, etd:excelDate(r[9]), eta:excelDate(r[10]), status:'Belum Sampai', lines:[]};
  groups[vessel].lines.push({ site:r[2], soNo:String(r[1]), expedition:r[5], shippingLine:r[6], containerSize:r[7] });
}

const now=Date.now();
Object.values(groups).forEach((g,i)=>{
  const id=uid()+i;
  const destinations=[...new Set(g.lines.map(l=>l.site))].join(', ');
  const payload={ id, vessel:g.vessel, destinations, closing:null, etd:g.etd, eta:g.eta,
    status:g.status, lines:g.lines, creatorId:'auto', createdAt:now, source:'Shipnet report import' };
  // PUT payload to https://workbook-ks-default-rtdb.asia-southeast1.firebasedatabase.app/shipments/<id>.json
});
```

Each `payload` was written with a single `curl -X PUT` per vessel (12 vessels, one call each —
never a bulk write). Result of the one-time run: 12 new shipment nodes added, 9 pre-existing
manual entries left untouched.

## How the app renders this data (for context, read-only — don't need to touch app code)

File: `Keluarga-Sultan-CERIA.html` (source of truth) → copied to `docs/index.html` → deployed via
GitHub Pages at **https://hanatrial.github.io/workbook/** (repo `hanatrial/workbook`, branch
`master`, `/docs` folder). The two HTML files must be kept byte-identical after any app-code
change — this import doesn't touch app code, so no deploy step is needed for a data-only import.

Relevant functions in that file: `shipmentArrived(s)` (checks `s.status` first, falls back to
ETA-vs-today), `shipmentEtdPassedNotArrived(s)` (true when `s.eta` has passed but not yet
arrived — shown as a red "⚠️ ETA passed, not yet arrived" banner), `viewShipments()` (renders
cards + the per-customer-site line table + the distributor filter dropdown), `toggleLineArrived`
/ `toggleShipmentArrived` (manual arrival checkboxes a team member can tap in the app itself).

## If this becomes a recurring automated task

Model it after the existing `meratus-jakarta-makassar-schedule` scheduled task in this session's
scheduler (`C:\Users\jose.christian\.claude\scheduled-tasks\`) — same pattern: fetch/parse →
build payload → `curl -X PUT` straight to Firebase, one node at a time, plus a chat summary of
what was added. Ask the user how they'll get a fresh Excel file each run (manual export from
Shipnet, since it's a login-gated internal system — not something a scheduled browser task can
pull on its own) before assuming full automation is possible.
