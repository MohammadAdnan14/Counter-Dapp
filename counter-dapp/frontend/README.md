# Counter dApp Frontend

Vite + React frontend for the Sails counter program.

## Environment

Copy `.env.example` to `.env.local` and set:

- `VITE_GEAR_ENDPOINT`: Vara/Gear websocket endpoint.
- `VITE_PROGRAM_ID`: deployed program id.

The current Rust crate has not generated a Sails `.idl` yet. Once the Sails program is implemented, copy the IDL snapshot into `src/generated/counter.idl` and generate the TypeScript client into `src/generated/lib.ts`.

Suggested command once the IDL exists:

```bash
cargo sails client-js frontend/src/generated/counter.idl frontend/src/generated/lib.ts
```

## Commands

```bash
npm install
npm run dev
npm run build
```
