export interface WithId {
  id: string;
}

/**
 * The JSON data returned from the backend can contain big numbers.
 * JSON can hold these big numbers. But when parsing JSON,
 * javascript loses precision on these values.
 * Therefor we use a special library to parse these big numbers.
 * These numbers get turned into strings. We can't be sure which
 * values get turned into strings. So a number value coming from the
 * backend can end up as a string or a number.
 * But since only big numbers will be strings,
 * and because we can't do any arithmetic with these numbers anyway,
 * the type can still
 *
 * When the value is a small number:
 * - it is kept as a number
 * - the number type is correct
 * - everything is normal
 *
 * When the value is a big number:
 * - it is turned into a string
 * - it can be shown in the UI as a string
 * - the number type is no longer correct
 *
 * Because we dont manipulate big numbers with arithmetic, and only
 * show them in the UI, it is safe to store these as strings and keep
 * the type as a number.
 */
export type ParsedNumber = number;

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

export const isNotUndefined = <T>(
  value: T | undefined
): value is NonNullable<T> => typeof value !== "undefined";

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

export const stringifyList = (items: string[]): string =>
  items.length <= 0 ? "" : items.reduce((acc, curr) => `${acc}, ${curr}`);

export const isObjectEmpty = (
  obj: Record<string, unknown>
): obj is Record<string, never> => Object.entries(obj).length <= 0;

/**
 * Get the keys of the provided object excluding the provided keys.
 */
export const getKeysExcluding = (
  excludedKeys: string[],
  object: Record<string, unknown>
): string[] => Object.keys(object).filter((key) => !excludedKeys.includes(key));

/**
 * Create a new object based on the provided object with only the provided keys.
 * The original order of the keys is preserved.
 */
export const keepKeys = (
  keys: string[],
  object: Record<string, unknown>
): Record<string, unknown> =>
  Object.keys(object).reduce((acc, cur) => {
    if (keys.includes(cur)) {
      acc[cur] = object[cur];
    }
    return acc;
  }, {});

export const resolvePromiseRecord = async (
  record: Record<string, Promise<unknown>>
): Promise<Record<string, unknown>> => {
  const list = Object.entries(record);
  const promises = list.map(([, promise]) => promise);
  const results = await Promise.all(promises);
  const resultList: [string, unknown][] = results.map((result, index) => [
    list[index][0],
    result,
  ]);
  return resultList.reduce<Record<string, unknown>>((acc, [id, result]) => {
    acc[id] = result;
    return acc;
  }, {});
};

export const stringifyObject = (
  obj: Record<string, unknown> | unknown
): string => {
  return typeof obj === "undefined" ? "undefined" : JSON.stringify(obj);
};
