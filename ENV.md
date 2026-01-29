# Environment variables

## Dashboard (required for stats)

- **CA** – Token contract address (Pump.fun). Shown in Hero; used for "Total Protocol Fees" (Pump.fun creator vault balance). Example: `DnK8GbpQfby6N9wFfifSfg32gjguXyc3qfVMsYkepump`
- **DEV_WALLET_ADDRESS** – Wallet used for "Fees converted to Gold" (sum of GOLD received in last 500 txs). Optional; if not set, that stat stays 0.

## RPC (needed for dashboard stats)

The dashboard reads **Total Protocol Fees** and **Fees converted to Gold** from Solana. The server needs an RPC endpoint:

- **HELIUS_RPC_URL** or **SOLANA_RPC** – Solana RPC URL. If not set, it uses the public mainnet (`https://api.mainnet-beta.solana.com`), which can be rate-limited. For production, set a dedicated RPC (e.g. [Helius](https://helius.dev), QuickNode) for better reliability.

## Firebase (distribution logs)

System logs in the dashboard are read from Firestore. Set these to enable:

- **FIREBASE_PROJECT_ID**
- **FIREBASE_CLIENT_EMAIL**
- **FIREBASE_PRIVATE_KEY** (full key; replace `\n` with real newlines if needed)

Firestore collection: `distributionLogs`. Documents: `transaction` (string, tx signature), `goldDistributed` (number), `date` (string, ISO or timestamp). You can edit these manually in Firebase Console.
