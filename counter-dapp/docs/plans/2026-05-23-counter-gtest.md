# Gtest Report

## Scope
Verify the Sails counter service with generated clients.

## Assertions
- Initial value is zero.
- `increment()` returns and stores incremented values.
- `decrement()` returns and stores decremented values.
- Unauthorized `reset()` returns `CounterError::Unauthorized` and preserves value.
- Owner `reset()` returns `Ok(())` and sets value to zero.

## Command
`cargo test --release`

## Result
Passes. The first runs timed out while compiling the initial Sails/gtest dependency graph; after the cache warmed and the generated-client API was corrected, the release suite passed with 2 gtest cases.

## Passing Output
- `counter_flow_works ... ok`
- `reset_is_owner_gated ... ok`
- `test result: ok. 2 passed; 0 failed`
