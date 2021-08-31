export interface WithId {
  id: string;
}

/**
 * We define the TimerId type explicitly because for some reason
 * the return type of setInterval is not always the same. In a DOM
 * context it is a number. But in a NodeJS context, it is something
 * more complex. TypeScript for now seems to confuse these 2 return
 * types. So we can't just use number. We need to use TimerId.
 */
export type TimerId = ReturnType<typeof setInterval>;

export interface Interval {
  timerId: TimerId;
  handler: () => void;
}

/**
 * Toggles a value in the list.
 * - If it is present, remove it.
 * - If it is missing, add it.
 */
export function toggleValueInList<T>(value: T, list: T[]): T[] {
  const index = list.indexOf(value);
  if (index === -1) {
    return [...list, value];
  }

  const clone = [...list];
  clone.splice(index, 1);
  return clone;
}

export const isNotNull = <T>(value: T | null): value is NonNullable<T> =>
  value !== null;

export type ValueObject<T> = Readonly<{
  type: string;
  value: T;
}>;

export const objectHasKey = <
  X extends Record<string, unknown>,
  Y extends PropertyKey
>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> => prop in obj;

export const isObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  if (value === null) return false;
  if (Object.keys(value).length <= 0) return false;
  return true;
};
