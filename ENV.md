# Environment variables – todas las necesarias

## Obligatorias para que el dashboard funcione bien

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| **CA** | Contrato del token (Pump.fun). Se muestra en el Hero y se usa para "Total Protocol Fees". | `DnK8GbpQfby6N9wFfifSfg32gjguXyc3qfVMsYkepump` |
| **HELIUS_RPC_URL** | URL del RPC de Solana (Helius u otro). Sin esto se usa el RPC público, que puede ir lento o limitado. | `https://mainnet.helius-rpc.com/?api-key=TU_API_KEY` |

## Opcionales (según lo que quieras usar)

| Variable | Descripción | Si no la pones |
|----------|-------------|----------------|
| **DEV_WALLET_ADDRESS** | Wallet para "Fees converted to Gold" (suma de GOLD recibido en las últimas 500 txs). | Esa stat queda en 0. |
| **SOLANA_RPC** | Alternativa a HELIUS_RPC_URL. Se usa si no existe HELIUS_RPC_URL. | Se usa HELIUS_RPC_URL o el RPC público. |
| **FIREBASE_PROJECT_ID** | Proyecto de Firebase (Firestore). Requerido para logs, distribuciones y config. | Logs, distribuciones y config quedan vacíos o por defecto. |
| **FIREBASE_CLIENT_EMAIL** | Email del service account de Firebase. | Necesario junto con FIREBASE_PRIVATE_KEY. |
| **FIREBASE_PRIVATE_KEY** | Clave privada del service account (con `\n` reales si hace falta). | Necesario junto con FIREBASE_CLIENT_EMAIL. |

## Solo para local / servidor (no en Vercel)

| Variable | Descripción | Por defecto |
|----------|-------------|-------------|
| **PORT** | Puerto del servidor. | `5000` |
| **HOST** | Host del servidor. | `127.0.0.1` |

## Automáticas (no las configuras tú)

- **NODE_ENV** – `production` en build; en local suele ser `development`.
- **VERCEL** – La define Vercel en deploy.

---

## Resumen mínimo para que “funcione todo”

1. **CA** – Para el Hero y Total Protocol Fees.
2. **HELIUS_RPC_URL** – Para que el dashboard lea bien de Solana (Total Protocol Fees y Fees converted to Gold).

Opcional pero recomendado:

3. **DEV_WALLET_ADDRESS** – Para que “Fees converted to Gold” tenga datos.
4. **FIREBASE_PROJECT_ID** + **FIREBASE_CLIENT_EMAIL** + **FIREBASE_PRIVATE_KEY** – Para Firestore (System Logs, distribuciones, config). Ver **FIREBASE_SETUP.md** para crear el proyecto y las colecciones.

Toda la persistencia es Firebase; no se usa PostgreSQL.
