export function parseNumberWithType (
  type: string,
  value: string,
): bigint | number | string | null {
  if (value === null) {
    return value;
  }

  try {
    const number = Number(value);

    if (Number.isInteger(number)) {
      if (!Number.isSafeInteger(number)) {
        return BigInt(value);
      }

      return number;
    }
    if (type.includes("int") || Number.isNaN(number)) return value;

    return number;
  } catch (_e) {
    return value;
  }
}
