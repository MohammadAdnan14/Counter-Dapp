# Generated Sails Client

Place the checked-in IDL snapshot at `counter.idl` and the generated TypeScript client at `lib.ts`.

Generate after the Rust Sails program exists:

```bash
cargo sails client-js frontend/src/generated/counter.idl frontend/src/generated/lib.ts
```
