export const sanitizeFromTo = (
  versionA: number,
  versionB: number
): { from: string; to: string } => ({
  from: Math.min(versionA, versionB).toString(),
  to: Math.max(versionA, versionB).toString(),
});
