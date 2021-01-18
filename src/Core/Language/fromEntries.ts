/* eslint-disable @typescript-eslint/no-explicit-any */

export const fromEntries = (pairs: any[][]): Record<any, any> => {
  return pairs.reduce((acc, curr) => {
    acc[curr[0]] = curr[1];
    return acc;
  }, {});
};
