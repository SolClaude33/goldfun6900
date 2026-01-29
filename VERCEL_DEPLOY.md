# Deploy on Vercel

This project is set up to run on [Vercel](https://vercel.com):

- **Static client** (React/Vite) is built to `dist/public` and served by Vercel.
- **API** (`/api/*`) is handled by a serverless function in `api/index.ts` (Express app).

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "GoldFunX6900: landing, dashboard, API, Vercel-ready"
git branch -M main
git remote add origin https://github.com/SolClaude33/goldfun6900.git
git push -u origin main
```

(If the repo already has content, use `git remote add origin ...` only if needed, then `git push -u origin main`.)

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub).
2. **Add New Project** → **Import** the repo `SolClaude33/goldfun6900`.
3. Leave **Build Command**: `npm run build`.
4. Leave **Output Directory**: `dist/public`.
5. **Environment variables** (in Project → Settings → Environment Variables):

   | Name | Description |
   |------|-------------|
   | `CA` | Token contract (Pump.fun). Shown in Hero; used for Total Protocol Fees. |
   | `DEV_WALLET_ADDRESS` | Wallet for "Fees converted to Gold" (optional). |
   | `HELIUS_RPC_URL` or `SOLANA_RPC` | Solana RPC for dashboard stats (recommended in production). |
   | `FIREBASE_PROJECT_ID` | Firebase project ID (required for Firestore). |
   | `FIREBASE_CLIENT_EMAIL` | Firebase service account email. |
   | `FIREBASE_PRIVATE_KEY` | Firebase service account private key. |
   | `FIREBASE_CLIENT_EMAIL` | Firebase service account (optional). |
   | `FIREBASE_PRIVATE_KEY` | Firebase private key (optional). |

6. Deploy. The site will be at `https://<project>.vercel.app`.

## 3. Optional: custom domain

In the Vercel project: **Settings → Domains** → add your domain.

## Notes

- The API runs as a **serverless function** (see `api/index.ts` and `vercel.json`). The handler is **self-contained** in `api/` (`api/index.ts` + `api/lib/`); it does not import from `server/`, so Vercel can resolve all modules.
- Local dev: `npm run dev` (Express + Vite on port 5000).
- See `ENV.md` for all environment variables.
- If you see **401** on `/favicon.png` or other static files, check **Vercel → Settings → Deployment Protection** (e.g. password protection can return 401).
