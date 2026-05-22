/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEAR_ENDPOINT?: string;
  readonly VITE_PROGRAM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
