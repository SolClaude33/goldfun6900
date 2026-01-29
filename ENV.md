# Environment variables

## Public / Dashboard

- **CA** – Token contract address (Pump.fun). Shown in Hero; used for "Total Protocol Fees" (Pump.fun creator vault balance). Example for testing: `DnK8GbpQfby6N9wFfifSfg32gjguXyc3qfVMsYkepump`
- **DEV_WALLET_ADDRESS** – Wallet address used to compute "Fees converted to Gold" (sum of GOLD received by this wallet in its last 500 transactions).

## Firebase (distribution logs)

System logs in the dashboard are read from Firestore. Set these to enable:

- **FIREBASE_PROJECT_ID**
- **FIREBASE_CLIENT_EMAIL**
- **FIREBASE_PRIVATE_KEY** (full key; replace `\n` with real newlines if needed)

Firestore collection: `distributionLogs`. Documents: `transaction` (string, tx signature), `goldDistributed` (number), `date` (string, ISO or timestamp). You can edit these manually in Firebase Console.

## Optional RPC

- **HELIUS_RPC_URL** or **SOLANA_RPC** – Used by read-only Solana (protocol fees, fees→gold). Default: public mainnet.
