# Architecture Note

## Summary
The app is a single standard Sails program exposing one `counter` service. The service owns a compact state object with the counter value and immutable owner.

## Program And Service Boundaries
- `Program::create()` initializes state and records `Syscall::message_source()` as owner.
- `Program::counter()` exposes the counter service.
- `Counter` service handles all read and write routes.

## State Ownership
`CounterState` is held in `Program` as `RefCell<CounterState>`. Business-significant state is `owner` and `value`; no derived collections are stored.

## Message Flow
All calls are direct Sails service messages. There is no delayed work, no reservations, no waitlist dependency, and no cross-program messaging.

## Routing And Public Interface
- Existing public routes that must remain stable: none; this is the first version.
- New routes introduced by this release: `Counter/Increment`, `Counter/Decrement`, `Counter/Reset`, `Counter/Value`.
- Any intentionally deprecated routes: none.
- Whether any method signature or reply shape changes are proposed: no released interface exists yet.

## Event Contract
- Existing events that must remain stable: none.
- New event surface introduced by this release: none.
- Whether any existing event payload changes are proposed: none.
- Whether event versioning is required: not for the first release.

## Generated Client Or IDL Impact
- This release requires IDL generation from the Rust Sails program.
- Rust gtest clients consume the generated Rust client.
- The React frontend consumes the IDL/TypeScript client generated from the Sails interface.
- No old and new generated clients need to coexist for this first deployment.

## Contract Version And Status Surface
- No explicit version route is exposed for this minimal dApp.
- No lifecycle status such as `Active` or `ReadOnly` is required.
- There is no previous version whose writes must be disabled.

## Off-Chain Components
- Frontend reads the Vara testnet endpoint and deployed Program ID from `.env`.
- No indexer is required.
- No automation scripts are required.

## Release And Cutover Plan
- Build and test locally.
- Deploy the optimized Wasm through IDEA portal.
- Add the deployed Program ID to `.env`.
- Start the Vite frontend and verify wallet-driven transactions against testnet.

## Failure And Recovery Paths
- Rollback target is the previous frontend configuration, if any.
- If deployment succeeds but frontend adoption fails, replace `VITE_COUNTER_PROGRAM_ID` with a known-good deployment or leave it empty to block writes visibly.
- No on-chain migration is needed for this first version.

## Open Questions
- Final Program ID is known only after IDEA portal deployment.
