export type AppEnv = {
  endpoint: string;
  programId: string;
  missing: string[];
};

export const getAppEnv = (): AppEnv => {
  const endpoint = import.meta.env.VITE_GEAR_ENDPOINT?.trim() ?? '';
  const programId = import.meta.env.VITE_PROGRAM_ID?.trim() ?? '';
  const missing = [
    !endpoint && 'VITE_GEAR_ENDPOINT',
    !programId && 'VITE_PROGRAM_ID',
  ].filter(Boolean) as string[];

  return { endpoint, programId, missing };
};
