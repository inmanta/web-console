export function parseNumberWithType(
  type: string,
  value: string,
): bigint | number | string | null {
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
  } catch (e) {
    return value;
  }
}
