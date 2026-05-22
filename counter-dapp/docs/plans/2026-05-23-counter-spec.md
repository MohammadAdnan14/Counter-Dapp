# Feature Spec

## Problem
A minimal Vara testnet dApp needs a Sails counter contract and React UI that can read and mutate on-chain state.

## User Goal
Connect a wallet, view the current counter value, increment or decrement it, and let the contract owner reset it to zero.

## In Scope
- Standard Sails project scaffolded with `cargo sails new`.
- Counter service with `increment()`, `decrement()`, `value()`, and owner-gated `reset()`.
- Generated Rust/IDL artifacts and a TypeScript frontend client path.
- Vite React frontend with wallet connection, value display, and `+1`, `-1`, `Reset` actions.
- Testnet configuration through `.env`.

## Out of Scope
- Token economics, vouchers, signless flows, indexing, or multi-program composition.
- Production migration support beyond documenting the first deployment path.

## Actors
- Owner: account that deploys/constructs the program and may call `reset()`.
- User: connected wallet account that may call `increment()` and `decrement()`.

## State Changes
- `increment()` adds one to the counter value.
- `decrement()` subtracts one from the counter value.
- `reset()` sets the value to zero only when called by the owner.

## Messages And Replies
- `increment() -> i32`
- `decrement() -> i32`
- `value() -> i32`
- `reset() -> Result<(), CounterError>`

## Events
No events are required for the minimal counter workflow; the frontend refetches the value after successful transactions.

## Invariants
- The owner is fixed at construction time.
- Unauthorized reset attempts do not mutate the counter value.
- The query value reflects the last successful state-changing command.

## Edge Cases
- Negative values are allowed.
- Reset at zero is allowed for the owner.
- Unauthorized reset returns `CounterError::Unauthorized`.

## Acceptance Criteria
- Local gtest verifies initial value, increment, decrement, and owner-gated reset.
- Frontend reads the configured Program ID and endpoint from `.env`.
- Connected wallet can submit increment/decrement/reset transactions.
- Counter value refetches after successful transactions.
