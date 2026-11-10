# Guideline AI (Cloudflare Worker)

Server kecil untuk tombol **Tanya AI** di `docs/guideline.html`. Server membaca isi guideline yang dipublikasikan, lalu meminta AI menjawab pertanyaan hanya dari materi itu. Kunci API **hanya** disimpan di server ini, tidak pernah di halaman.

Memakai API format OpenAI-compatible (`POST {LLM_BASE_URL}/chat/completions`), misalnya OpenCode.

## Pasang (sekali saja)

Butuh akun Cloudflare (paket gratis cukup) dan Node.js.

```bash
cd workers/guideline-ai
npm install
npx wrangler login
```

1. Buka `wrangler.toml`, lalu isi dari dokumentasi OpenCode:
   - `LLM_BASE_URL`: alamat dasar API (tanpa `/chat/completions`).
   - `LLM_MODEL`: nama model yang dipakai.
   - `USE_IMAGES`: ubah ke `"true"` hanya bila modelnya mendukung gambar (vision). Tanpa gambar, AI hanya membaca teks, padahal isi Struktur dan Inisiatif Area di Handle IGR berupa gambar.
2. Simpan kunci sebagai secret (jangan di file, jangan di chat):
   ```bash
   npx wrangler secret put LLM_API_KEY
   ```
3. Deploy:
   ```bash
   npx wrangler deploy
   ```
   Hasilnya alamat seperti `https://guideline-ai.<akun>.workers.dev`.
4. Di `docs/guideline.html`, isi `content` pada `<meta name="guideline-ai-endpoint" content="">` dengan alamat itu, ditambah `/ask` (apa pun path-nya diterima), lalu push ke `master`. Tombol **Tanya AI** muncul setelahnya.

## Keamanan dan biaya

- Hanya permintaan dari `ALLOWED_ORIGIN` (`https://hanatrial.github.io`) yang dilayani.
- Pertanyaan maksimal 400 karakter. Batas kasar 8 per menit dan 60 per hari per IP, dihitung per instance Worker. Untuk batas yang ketat, tambahkan aturan Rate Limiting di dashboard Cloudflare.
- Tiap pertanyaan memakai kuota/biaya penyedia AI. Pantau pemakaiannya di dashboard penyedia.
- Jangan menaruh data sensitif (kata sandi, nomor telepon) di `guideline.html`, karena isinya ikut dikirim ke AI.

## Uji lokal

```bash
npx wrangler dev   # lalu POST {"question":"..."} dengan header Origin sesuai ALLOWED_ORIGIN
```
