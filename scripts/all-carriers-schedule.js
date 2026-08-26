#!/usr/bin/env node
/**
 * Combined scraper for Meratus, Tanto, SPIL and Temas public schedule
 * search endpoints. Pulls JAKARTA and SURABAYA sailings to a fixed list of
 * Sulawesi destinations and writes report.md (UTF-8) next to this script,
 * in the exact markdown the workbook app's Ship > Jakarta Schedule
 * "Paste new report" expects (`## Destination` heading + a
 * `| Carrier | Vessel/Voyage | ETD | ETA | Route Type |` table).
 *
 * Usage:  node scripts/all-carriers-schedule.js
 * Requires Node 18+ (built-in fetch). No API keys — these are the same
 * public endpoints each carrier's own schedule-search page calls.
 *
 * Not every carrier serves every destination (e.g. Tanto has no direct
 * Manado/Palu route, Meratus/Temas have no Poso). Missing combinations are
 * silently skipped rather than treated as errors.
 */

const fs = require('fs');
const path = require('path');

const ORIGINS = ['JAKARTA', 'SURABAYA'];
// Canonical destination names used for matching against each carrier's own
// port list. "BITUNG" covers Manado traffic (no carrier here sails direct
// to Manado's own port); "PANTOLOAN" covers Palu.
const DESTINATIONS = ['MAKASSAR', 'KENDARI', 'GORONTALO', 'POSO', 'BITUNG', 'PALU', 'MOROWALI (BUNGKU)'];

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
};

// Any of these 4 sites can hang indefinitely on a bad connection — a plain
// fetch() with no timeout would then block the whole script forever. Give
// every request 15s and treat a timeout the same as any other failure
// (skip that one lookup, don't crash the run).
async function fetchT(url, opts = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function fmtWIB(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(' pukul', '') + ' WIB';
}

/* ---------------- Tanto ---------------- */
const TANTO_API = 'https://sync.tantooffice.com/api/tcm/';
async function tantoCities() {
  const res = await fetchT(TANTO_API + 'get_city_schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...BROWSER_HEADERS, Origin: 'https://www.tantonet.com', Referer: 'https://www.tantonet.com/schedule.php' },
    body: 'act=city',
  }).then(r => r.json());
  const byName = {};
  res.kota.forEach(k => { byName[k.nama_kota] = k; });
  return byName;
}
async function tantoSchedule(cities, originName, destNames) {
  const pol = cities[originName];
  if (!pol) return [];
  const pods = destNames.map(n => cities[n]).filter(Boolean);
  if (!pods.length) return [];
  const body = new URLSearchParams();
  body.append('pol', pol.id_kota);
  body.append('kota_asal', pol.nama_kota);
  pods.forEach((p, i) => { body.append(`listPod[${i}][kode]`, p.id_kota); body.append(`listPod[${i}][nama]`, p.nama_kota); });
  const res = await fetchT(TANTO_API + 'get_schedule_multi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...BROWSER_HEADERS, Origin: 'https://www.tantonet.com', Referer: 'https://www.tantonet.com/schedule.php' },
    body,
  }).then(r => r.json());
  const out = [];
  (res.data || []).forEach(d => {
    (d.jadwal || []).filter(r => !r.error).forEach(r => {
      out.push({ dest: d.kota_tujuan, carrier: 'Tanto', vessel: r.vessel, etd: r.tgl_etd, eta: r.tgl_eta || '-', route: r.is_direct ? 'Direct' : 'Transit' });
    });
  });
  return out;
}

/* ---------------- Meratus ---------------- */
const MERATUS_API = 'https://api.meratus-one.com';
const MERATUS_HEADERS = { Accept: 'application/json', 'X-Client-Type': 'web', ...BROWSER_HEADERS };
async function meratusNodes() {
  const res = await fetchT(`${MERATUS_API}/nodes`, { headers: MERATUS_HEADERS }).then(r => r.json());
  const byName = {};
  res.items.forEach(i => { byName[i.name.toUpperCase()] = i; });
  return byName;
}
function meratusFindNode(nodes, destName) {
  if (destName === 'BITUNG') return nodes['BITUNG'];
  if (destName === 'PALU') return nodes['PANTOLOAN'];
  const hit = Object.keys(nodes).find(n => n.includes(destName));
  return hit ? nodes[hit] : null;
}
async function meratusSchedule(nodes, originName, destNames) {
  const pol = originName === 'JAKARTA' ? nodes['JAKARTA, TANJUNG PRIOK'] : nodes['SURABAYA, TANJUNG PERAK'];
  if (!pol) return [];
  const out = [];
  for (const destName of destNames) {
    const del = meratusFindNode(nodes, destName);
    if (!del) continue;
    const params = new URLSearchParams({ por: pol.portCode, del: del.portCode, etd: new Date().toISOString().slice(0, 10) });
    const res = await fetchT(`${MERATUS_API}/schedules?${params}`, { headers: MERATUS_HEADERS }).then(r => r.json()).catch(() => null);
    (res?.items || []).forEach(it => {
      out.push({ dest: destName, carrier: 'Meratus', vessel: `${it.vesselName} / ${it.voyageNo}`, etd: it.etd, eta: it.eta, route: it.routingType || 'Direct' });
    });
  }
  return out;
}

/* ---------------- SPIL ---------------- */
async function spilSchedule(originName, destNames) {
  const originTitle = originName[0] + originName.slice(1).toLowerCase();
  const out = [];
  for (const destName of destNames) {
    const destTitle = destName === 'BITUNG' ? 'Manado' : destName === 'PALU' ? 'Palu' : destName[0] + destName.slice(1).toLowerCase();
    const url = `https://www.myspil.com/myspilcom/port/select?portfrom=${encodeURIComponent(originTitle)}&portto%5B%5D=${encodeURIComponent(destTitle)}&etd=&vesselname=&vesselid=`;
    const html = await fetchT(url, { headers: BROWSER_HEADERS }).then(r => r.text()).catch(() => '');
    const re = /<input type="hidden" name="([a-zA-Z_]+)" value="([^"]*)">/g;
    let m, cur = null;
    const seen = new Set();
    while ((m = re.exec(html))) {
      const [, name, value] = m;
      if (name === 'portfrom') { if (cur) flush(cur); cur = {}; }
      if (cur) cur[name] = value;
    }
    if (cur) flush(cur);
    function flush(r) {
      if (r.action !== 'fromsearch' || !r.vesselname) return;
      const key = r.vesselname + r.voyageno + r.etd_char;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ dest: destName, carrier: 'SPIL', vessel: `${r.vesselname} / ${r.voyageno}`, etd: r.etd_char, eta: r.eta, route: 'Direct' });
    }
  }
  return out;
}

/* ---------------- Temas ---------------- */
async function temasTerminalCode(name) {
  const url = `https://www.kliktemas.com/api/core/terminals?page=0&size=20&sort=created_at%2Cdesc&sortBy=created_at&sortDir=desc&isPort=1&sortBy=name&sortDir=asc&query=${encodeURIComponent(name)}`;
  const res = await fetchT(url, { headers: BROWSER_HEADERS }).then(r => r.json()).catch(() => null);
  return res?.data?.contents?.[0]?.code || null;
}
async function temasSchedule(originCode, originName, destNames, destCodes) {
  const out = [];
  const from = new Date().toISOString().slice(0, 10);
  const to = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  for (const destName of destNames) {
    const code = destCodes[destName];
    if (!code || !originCode) continue;
    const params = `routes[0][portOfDischargeCode]=${code}&routes[0][portOfLoadingCode]=${originCode}&routes[0][departureAt][from]=${from}&routes[0][departureAt][to]=${to}`;
    const res = await fetchT(`https://www.kliktemas.com/api/times-shipping/schedules?${params}`, { headers: BROWSER_HEADERS }).then(r => r.json()).catch(() => null);
    const contents = res?.data?.routes?.[0]?.result?.contents || [];
    // The API returns every possible combination of connecting vessels for
    // the same overall journey (identical ETD/ETA, different middle legs) —
    // collapse those down to one row per unique departure+arrival.
    const seenJourneys = new Set();
    contents.forEach(c => {
      const key = `${c.estimatedDepartureAt}|${c.estimatedArrivalAt}`;
      if (seenJourneys.has(key)) return;
      seenJourneys.add(key);
      const direct = c.countVoyage === 1;
      const vessels = direct
        ? `${c.segments[0].vessel.name} / ${c.segments[0].voyageNumber}`
        : `${c.segments[0].vessel.name} / ${c.segments[0].voyageNumber} -> ... -> ${c.segments[c.segments.length - 1].vessel.name} / ${c.segments[c.segments.length - 1].voyageNumber}`;
      out.push({ dest: destName, carrier: 'Temas', vessel: vessels, etd: c.estimatedDepartureAt, eta: c.estimatedArrivalAt, route: direct ? 'Direct' : 'Transit' });
    });
  }
  return out;
}

/* ---------------- Report assembly ---------------- */
function toMarkdownTable(rows) {
  const head = ['Carrier', 'Vessel/Voyage', 'ETD', 'ETA', 'Route Type'];
  const lines = [
    `| ${head.join(' | ')} |`,
    `|${head.map(() => '---').join('|')}|`,
    ...rows.map(r => `| ${r.carrier} | ${r.vessel} | ${fmtDate(r.etd)} | ${fmtDate(r.eta)} | ${r.route} |`),
  ];
  return lines.join('\n');
}
function fmtDate(v) {
  if (!v || v === '-') return '-';
  // Tanto/SPIL already return human dates like "21 Aug 2026"; Meratus/Temas return ISO.
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return fmtWIB(v);
  return v;
}

async function main() {
  const [tCities, mNodes] = await Promise.all([tantoCities(), meratusNodes()]);

  const temasDestCodes = {};
  for (const d of DESTINATIONS) temasDestCodes[d] = await temasTerminalCode(d === 'PALU' ? 'Palu' : d === 'BITUNG' ? 'Bitung' : d);
  const temasJkt = await temasTerminalCode('Jakarta');
  const temasSby = await temasTerminalCode('Surabaya');

  const out = [`# Jadwal Kapal Jakarta & Surabaya - ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, ''];

  for (const originName of ORIGINS) {
    out.push(`## Dari ${originName[0] + originName.slice(1).toLowerCase()}`, '');
    const [tanto, meratus, spil, temas] = await Promise.all([
      tantoSchedule(tCities, originName, DESTINATIONS),
      meratusSchedule(mNodes, originName, DESTINATIONS),
      spilSchedule(originName, DESTINATIONS),
      temasSchedule(originName === 'JAKARTA' ? temasJkt : temasSby, originName, DESTINATIONS, temasDestCodes),
    ]);
    [['Tanto', tanto], ['Meratus', meratus], ['SPIL', spil], ['Temas', temas]].forEach(([name, rows]) => {
      if (!rows.length) console.error(`⚠️  ${name}: 0 results for ${originName} — site may be slow/blocking; check manually if this persists`);
    });
    const all = [...tanto, ...meratus, ...spil, ...temas];

    for (const destName of DESTINATIONS) {
      const label = destName === 'BITUNG' ? 'Bitung (Manado)' : destName === 'PALU' ? 'Palu (Pantoloan)' : destName[0] + destName.slice(1).toLowerCase();
      const rows = all.filter(r => r.dest === destName).sort((a, b) => new Date(a.etd) - new Date(b.etd));
      if (!rows.length) continue; // no carrier has this route right now
      out.push(`### ${label}`, '');
      out.push(toMarkdownTable(rows), '');
    }
  }

  const md = out.join('\n');
  const outPath = path.join(__dirname, 'report.md');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`Saved ${outPath}\n`);
  console.log(md);
}

main().catch(err => { console.error(err); process.exit(1); });
