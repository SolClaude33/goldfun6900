# GoldFunX6900 Token

## Overview
GoldFunX6900 is a Solana token launching on Pumpfun with automatic fee distribution to holders. The system claims creator fees from Pumpfun and distributes them as follows:
- **70%** → Buy $GOLD → Distribute to major holders (≥0.5% supply)
- **20%** → Buy $GOLD → Distribute to medium holders (0.1% - 0.49% supply)
- **10%** → Buybacks (buy GoldFunX token from the market)
- **Frequency** → Every 15 minutes

## Current State
- Landing page with hero section and "CA: SOON" placeholder
- LiveDashboard component displaying real distribution data (stats + transaction logs)
- Database configured for tracking distributions and holder snapshots
- Full Solana integration with PumpSwap fee claiming, Jupiter swaps, and SPL distributions

## Architecture

### Frontend (client/)
- React + TypeScript + Vite
- TailwindCSS for styling
- Wouter for routing
- TanStack Query for data fetching

### Backend (server/)
- Express.js
- PostgreSQL with Drizzle ORM
- Solana Web3.js for blockchain interaction

### Key Files
- `client/src/components/Hero.tsx` - Landing page hero section
- `client/src/components/LiveDashboard.tsx` - Real-time distribution stats and logs
- `server/routes.ts` - API routes (public only)
- `server/solana-read.ts` - Read-only Solana (protocol fees, fees→gold)
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Database schema

## Solana Integration Details

### PumpSwap Fee Claiming
- Uses official PumpSwap program: `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`
- Derives pool PDA from token mint + WSOL mint
- Claims accumulated creator fees from coin_creator_vault_ata

### Jupiter V6 Swap
- API endpoint: `https://public.jupiterapi.com` (public proxy)
- Wraps SOL to wSOL before swapping
- Swaps wSOL → $GOLD with dynamic slippage protection
- Retry logic with 3 attempts

### SPL Token Distribution
- Gets token holders with >0.5% supply
- Calculates proportional share for each holder
- Creates ATAs for holders if needed
- Transfers $GOLD using SPL token transfer instructions

### Token Buybacks
- Uses 10% of fees to buy GoldFunX token via Jupiter
- Supports token price and reduces circulating supply
- Executed automatically after each distribution

## Configuration

### Required / recommended env
1. `CA` - Token contract (Pump.fun). For Hero and Total Protocol Fees.
2. `DEV_WALLET_ADDRESS` - Wallet for "Fees converted to Gold" (optional).
3. `HELIUS_RPC_URL` or `SOLANA_RPC` - RPC for dashboard stats (recommended in production).

### Distribution Parameters (Tiered System)
- **70%** of fees → Buy $GOLD → Distribute to major holders (≥0.5% supply)
- **20%** of fees → Buy $GOLD → Distribute to medium holders (0.1% - 0.49% supply)
- **10%** of fees → Buybacks (buy GoldFunX token via Jupiter)
- Hourly automatic distribution scheduler

### Token Addresses
- $GOLD (Jupiter tokenized gold): `GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A`
- PumpSwap Program: `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`
- GlobalConfig PDA: `ADyA8hdefvWN2dbGGWFotbzWxrAvLW83WG6QCVXvJKqw`

### Wallet Balance Protection
- Tracks SOL balance before and after fee claiming
- Only uses the positive difference (actual fees received) for distributions
- Skips distribution entirely if fees are offset by transaction costs
- Protects user-funded SOL from being used for swap/burn operations

## Recent Changes (Dec 30, 2025)
- **FIXED: Logging math for goldReceived** - Database logs now correctly show normalized shares within each tier (matching actual on-chain distribution)
- **Rebranding complete**: All text references updated from Metal to Gold (THE GOLD TIMES, GOLD TV, GOLD SUPERCYCLE)
- **Social links updated**: Twitter links to x.com/Goldfunx6900, Telegram removed

## Previous Changes (Dec 29, 2025)
- **Added Pump.fun bonding curve buy/sell**: Direct swap functions `buyViaPumpfun()` and `sellViaPumpfun()` for tokens still on bonding curve
- **Dual-swap strategy**: Buyback tries Pump.fun bonding curve first, falls back to Jupiter for AMM-migrated tokens
- **Added getBondingCurveState()**: Fetches virtual/real reserves for price calculation
- **Token 2022 Program support**: Full support for Token 2022 program used by new Pump.fun tokens
- **Buyback limitation**: Requires either active bonding curve OR Jupiter AMM liquidity
- **FIXED: Pump.fun Fee Claiming** - Corrected PDA derivation to use seeds ["creator-vault", creator] with the Pump.fun bonding curve program (6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P)
- **Added dual-program support**: System first tries Pump.fun bonding curve, then falls back to PumpSwap AMM
- **Non-blocking buyback**: Distribution succeeds even if buyback fails due to low liquidity
- Actualizado CA oficial: `BEJRWWYD227mmUb4nCBbMxFMvAbkLdSHFMY9Wdjupump`
- Configurada wallet del dev: `4ZhzViefj8zaLNe6y84FUzEe1Mkg28SNgekqU2K1UoPg`
- Frecuencia de distribución aumentada a cada 15 minutos (antes 1 hora)
- Implemented tiered distribution system: 70% major holders, 20% medium holders, 10% buybacks
- Added token buyback functionality via Jupiter (replaces SOL burning)
- Added wallet balance protection to ensure only claimed fees are used
- Implemented full Solana service with real blockchain interactions (no mocks)
- Integrated Jupiter V6 API with SOL wrapping and retry logic
- Added SPL token transfers with ATA creation for holders
- Integrated real distribution data into LiveDashboard on main page
- Added public API endpoints for stats and distributions
- Fixed gold text color visibility in light mode

## Pump.fun Bonding Curve Integration (Updated Dec 30, 2025)

### Buy Instruction Accounts (16 total, in order)
1. `global` - Global config PDA
2. `fee_recipient` - Fee recipient account (writable)
3. `mint` - Token mint address
4. `bonding_curve` - Bonding curve PDA (writable)
5. `associated_bonding_curve` - Associated token account for bonding curve (writable)
6. `associated_user` - User's token ATA (writable)
7. `user` - User wallet (signer, writable)
8. `system_program` - System program
9. `token_program` - Token2022 program for new tokens
10. `creator_vault` - PDA with seeds ["creator-vault", creator] (writable)
11. `event_authority` - Event authority PDA
12. `program` - Pump.fun program ID
13. `global_volume_accumulator` - PDA with seed ["global_volume_accumulator"]
14. `user_volume_accumulator` - PDA with seeds ["user_volume_accumulator", user] (writable)
15. `fee_config` - PDA with seeds ["fee_config", PUMP_PROGRAM_ID] owned by fee program
16. `fee_program` - `pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ`

### Instruction Data
- Discriminator: `[102, 6, 61, 18, 1, 218, 235, 234]` (8 bytes)
- amount (u64): Token amount to receive (8 bytes)
- max_sol_cost (u64): Maximum SOL to spend (8 bytes)
- track_volume (OptionBool): 0=None, 1=Some(false), 2=Some(true) (1 byte)

### Bonding Curve Account Structure (150+ bytes)
- offset 0-7: discriminator `[0x17, 0xb7, 0xf8, 0x37, 0x60, 0xd8, 0xac, 0x60]`
- offset 8-15: virtualTokenReserves (u64)
- offset 16-23: virtualSolReserves (u64)
- offset 24-31: realTokenReserves (u64)
- offset 32-39: realSolReserves (u64)
- offset 40-47: tokenTotalSupply (u64)
- offset 48: complete (bool)
- offset 49-80: creator (Pubkey, 32 bytes)

### PDA Derivations
- Bonding curve: `["bonding-curve", mint]` → PUMP_PROGRAM_ID
- Creator vault: `["creator-vault", creator]` → PUMP_PROGRAM_ID
- Global volume: `["global_volume_accumulator"]` → PUMP_PROGRAM_ID
- User volume: `["user_volume_accumulator", user]` → PUMP_PROGRAM_ID
- Fee config: `["fee_config", PUMP_PROGRAM_ID]` → PUMP_FEE_PROGRAM_ID

### Program IDs
- Pump.fun: `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`
- Fee Program: `pfeeUxB6jkeY1Hxd7CsFCAjcbHA9rWtchMGdZ6VojVZ`
- PumpSwap AMM: `pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA`

## TODO (When Token Launches)
1. Add TOKEN_CONTRACT_ADDRESS secret with the new CA
2. Add CREATOR_WALLET_PRIVATE_KEY secret for the creator wallet
3. Fund the wallet with SOL for transaction fees (~0.05 SOL per distribution)
4. Monitor hourly automatic distribution via scheduler
