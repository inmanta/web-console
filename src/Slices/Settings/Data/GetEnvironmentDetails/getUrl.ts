export const getUrl = (details: boolean, environment: string) =>
  `/api/v2/environment/${environment}?details=${details}`;
