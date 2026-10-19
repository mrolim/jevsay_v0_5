# JevSay Phase 0.5 — 3D Conversational Kiosk POC (Astro + Cloudflare)

ระบบผู้ช่วย 3D อัจฉริยะตู้คีออสและหน้าเว็บ เวอร์ชัน 0.5 ทำงานด้วย **Astro SSR บน Cloudflare Pages / Workers** รองรับภาษาไทย 100% พร้อมระบบลิปซิงค์ความเร็วสูงระดับ Edge ในไทย

## วิธีทดสอบในเครื่อง (Local Dev)
```bash
npm install
npm run dev
```

## วิธี Deploy ขึ้น Cloudflare Pages ทันที
```bash
npm run build
npx wrangler pages deploy dist --project-name jevsay-poc
```
