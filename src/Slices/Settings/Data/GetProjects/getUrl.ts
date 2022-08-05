export const getUrl = (environmentDetails: boolean): string =>
  `/api/v2/project?environment_details=${environmentDetails}`;
