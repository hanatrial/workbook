#!/usr/bin/env node
/**
 * Scraper for Tanto Intim Line's public schedule API (tantonet.com/schedule.php).
 * Pulls JAKARTA and SURABAYA sailing schedules to the destinations listed below,
 * and prints markdown in the exact format the workbook app's "Paste new report"
 * (Ship → Jakarta Schedule) expects: `## Destination` heading + a
 * `| Vessel | ... | ETD | ETA |` table per destination.
 *
 * Usage:  node scripts/tanto-schedule.js > report.md
 * Requires Node 18+ (built-in fetch). No API key — this is the same endpoint
 * the public schedule.php page calls from the browser.
 */

const API = 'https://sync.tantooffice.com/api/tcm/';

// Destinations to check per origin. Edit freely — must match Tanto's city names
// EXACTLY (run with DEBUG_CITIES=1 to print every valid name Tanto serves).
// Note: Tanto has no direct Manado or Palu service — those aren't in their city list.
const ORIGINS = ['JAKARTA', 'SURABAYA'];
const DESTINATIONS = ['MAKASSAR', 'KENDARI', 'GORONTALO', 'POSO', 'BITUNG', 'MOROWALI (BUNGKU)'];

async function getCities() {
  const res = await fetch(API + 'get_city_schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.tantonet.com',
      'Referer': 'https://www.tantonet.com/schedule.php',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
    body: 'act=city',
  });
  const json = await res.json();
  if (!json.status) throw new Error('Failed to load city list');
  const byName = {};
  json.kota.forEach(k => { byName[k.nama_kota] = k; });
  return byName;
}

async function getSchedule(polId, polName, pods) {
  const body = new URLSearchParams();
  body.append('pol', polId);
  body.append('kota_asal', polName);
  pods.forEach((p, i) => {
    body.append(`listPod[${i}][kode]`, p.id_kota);   // API's "kode" field is actually id_kota, not kode_kota
    body.append(`listPod[${i}][nama]`, p.nama_kota);
  });
  const res = await fetch(API + 'get_schedule_multi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.tantonet.com',
      'Referer': 'https://www.tantonet.com/schedule.php',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    },
    body,
  });
  const json = await res.json();
  if (!json.status) throw new Error('Schedule request failed');
  return json.data; // [{ kota_asal, kota_tujuan, jadwal:[...] }, ...]
}

function toMarkdownTable(rows) {
  const head = ['Vessel', 'Route', 'Closing', 'ETD', 'ETA'];
  const lines = [
    `| ${head.join(' | ')} |`,
    `|${head.map(() => '---').join('|')}|`,
    ...rows.map(r => `| ${r.vessel} | ${r.rute} | ${r.tgl_close} | ${r.tgl_etd} | ${r.tgl_eta} |`),
  ];
  return lines.join('\n');
}

async function main() {
  const cities = await getCities();
  if (process.env.DEBUG_CITIES) {
    console.error('Valid city names:', Object.keys(cities).sort().join(', '));
  }
  const pods = DESTINATIONS.map(name => {
    const c = cities[name];
    if (!c) throw new Error(`Unknown destination city: ${name} — check spelling against Tanto's city list`);
    return c;
  });

  const out = [`# Jadwal Kapal Tanto — ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, ''];

  for (const originName of ORIGINS) {
    const pol = cities[originName];
    if (!pol) throw new Error(`Unknown origin city: ${originName}`);
    const data = await getSchedule(pol.id_kota, pol.nama_kota, pods);
    for (const dest of data) {
      const rows = (dest.jadwal || []).filter(r => !r.error);
      if (!rows.length) continue; // skip destinations with no sailings, keeps the report short
      out.push(`## ${dest.kota_asal} - ${dest.kota_tujuan}`, '');
      out.push(toMarkdownTable(rows), '');
    }
  }

  console.log(out.join('\n'));
}

main().catch(err => { console.error(err); process.exit(1); });
