# ERC20-Indexer

An ERC-20 transfer indexer: it reads USDC `Transfer` events from Ethereum, stores them in `PostgreSQL`, and exposes a `REST` / `GraphQL` API with the aggregations a node cannot provide.

## Problem

An Ethereum node can only answer two kinds of questions:

- What is address X's balance right now — a `balanceOf` call on the contract
- Give me the contract's logs for blocks N..M — `eth_getLogs`

It cannot answer anything that requires aggregation:

- Top 100 token holders
- Balance history by day
- Transfer volume over a date range, number of unique senders
- All transfers larger than N tokens

The last one is impossible at the node level because only `from` and `to` are indexed in the `Transfer` event. The amount is not a topic, so it cannot be filtered on.

Indexers exist for exactly this: load the events, put them into a relational model, serve them through indexes. `The Graph`, `Dune`, `Covalent` and similar services do the same thing at a much larger scale. This project is a small version of that idea.

## What ERC-20 is, and why events are the data source

ETH is the native currency, and the protocol itself tracks its balances. USDC, USDT and DAI are unknown to the protocol — each of them is a separate smart contract holding a `mapping(address => uint256) balances`. A wallet's balance is a record in that contract's storage.

ERC-20 is an interface standard (`transfer`, `balanceOf`, `approve`, ...) that lets wallets and exchanges work with any token without knowing its internals. Part of the standard is an event:

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

Events have no effect on consensus. They exist precisely for consumers like this project — so that we can find out what happened.

## How it works

```
Ethereum ──> Alchemy RPC ──> Indexer ──> PostgreSQL ──> Service layer ──┬──> REST
             (JSON-RPC)      (viem)      (Drizzle)                      └──> GraphQL
```

No subscriptions, no push model: the indexer polls for logs in block ranges and advances the `last_processed_block` cursor in the database.

The loop, roughly:

- Get the current chain height (`eth_blockNumber`)
- Request `Transfer` logs for a range starting at the cursor, staying `CONFIRMATIONS` blocks behind the head
- Decode them, fold them into balances, and write them together with the new cursor value in a single database transaction
- Repeat

The cursor must move in the same transaction as the data, so that a crash makes the indexer redo work rather than leave a gap. The `txHash-logIndex` primary key makes processing idempotent: if the key already exists, the log has been handled and we move on.

## Technical decisions

**Why an external RPC provider.** Ethereum has no single API — there are nodes with a JSON-RPC interface. Running your own means ~2 TB of SSD and a long sync. An archive node, which is required for state queries against historical blocks, costs even more. Alchemy provides managed access.

The trade-off is provider limits: on the free tier `eth_getLogs` is capped at a 10-block range. The batch size is therefore configurable, and on a "range too large" error it is halved and retried, then gradually restored after successful requests.

**Why viem instead of hand-rolled JSON-RPC.** A node accepts and returns hex: addresses zero-padded to 32 bytes, ABI-encoded arguments, keccak256 hashes of event signatures. viem handles request encoding and response decoding, and more importantly **infers types from the ABI**: `log.args.value` comes out as `bigint` and `log.args.from` as `` `0x${string}` ``, with no hand-written interfaces.

**Why `numeric(78, 0)`.** `uint256` values run up to 78 decimal digits and fit neither in a JS `Number` (~2^53) nor in a Postgres `bigint` (int64). In code it is `bigint`; in the database, `numeric(78, 0)`.

**Why amounts are stored in base units.** `decimals` is a display instruction, not a sign of a fractional type: USDC has `decimals = 6`, so `1000000` means 1 USDC. The raw integer goes into the database, `decimals` lives in the token table, and the conversion happens only at the API layer.

**Why both REST and GraphQL.** Both APIs are thin adapters over a shared service layer. REST is convenient for simple queries and HTTP caching; GraphQL solves over-fetching and waterfall requests and is the de facto standard in web3 (The Graph serves its data over GraphQL). N+1 in resolvers is handled with DataLoader.

## Known limitations

- Balances are relative, counted from `env.START_BLOCK` - negative balances are possible because of it. For example now from 12203 rows only 3751 have positive balance, which is 31%
- "Top holders" are in reality just "top for net inflow from block N"
- `COUNT(*)` on each `GET /holders` `GET /tokens` requests are high compute-cost SQL, in future on larger datasets it will slow API. Will be fixed using 30 secs TTL cache or other solution
- Rate limiting with in-process store. In future will be replaced by Redis or PostgreSQL based limiters

## Stack

TypeScript · viem · PostgreSQL · Drizzle ORM · Express · GraphQL · Zod · Vitest · Docker Compose · GitHub Actions

## Status

- [x] Reading and decoding logs with viem
- [x] Database schema and migrations (Drizzle)
- [x] Backfill with a cursor and adaptive batch size
- [x] Balance aggregation
- [x] Balance reconciliation from `transfers` via SQL aggregation
- [x] REST API (Express + Zod)
- [x] Docker Compose
- [ ] Tests (Vitest + testcontainers)
- [ ] CI
- [ ] GraphQL
- [ ] Realtime mode
- [ ] Reorg handling
- [ ] Absolute balances via a `multicall` snapshot at `START_BLOCK`
