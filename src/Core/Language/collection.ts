export const identity = <T>(value: T): T => value;

export const uniq = <T>(array: T[]): T[] => Array.from(new Set(array));

export const without = <T>(array: T[], value: T): T[] => array.filter((item) => item !== value);

export const reject = <T>(array: T[], predicate: (item: T) => boolean): T[] =>
  array.filter((item) => !predicate(item));

export const times = <T>(n: number, iteratee: (index: number) => T): T[] => {
  const result: T[] = [];

  for (let index = 0; index < n; index += 1) {
    result.push(iteratee(index));
  }

  return result;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const cloneDeep = <T>(value: T): T => {
  const globalStructuredClone = (globalThis as { structuredClone?: <U>(v: U) => U })
    .structuredClone;

  if (typeof globalStructuredClone === "function") {
    try {
      return globalStructuredClone(value);
    } catch {
      // Fall back to JSON-based clone below
    }
  }

  // Fallback for JSON-compatible data structures
  return JSON.parse(JSON.stringify(value));
};

export const isEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;

  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  // Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  // Arrays
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }

    for (let index = 0; index < a.length; index += 1) {
      if (!isEqual(a[index], b[index])) return false;
    }

    return true;
  }

  // Plain objects
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;

  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (!(key in bObj)) {
      return false;
    }

    if (!isEqual(aObj[key], bObj[key])) {
      return false;
    }
  }

  return true;
};

export const merge = <T extends Record<string, unknown>, S extends Record<string, unknown>>(
  target: T,
  source: S
): T & S => {
  const targetObj = target as Record<string, unknown>;

  for (const [key, value] of Object.entries(source)) {
    const existing = targetObj[key];

    // Deep-merge arrays by index, similar to lodash.merge
    if (Array.isArray(value) && Array.isArray(existing)) {
      const maxLength = Math.max(existing.length, value.length);
      const mergedArray: unknown[] = [];

      for (let index = 0; index < maxLength; index += 1) {
        const fromTarget = existing[index];
        const fromSource = value[index];

        if (fromSource === undefined) {
          mergedArray[index] = cloneDeep(fromTarget);
        } else if (isPlainObject(fromTarget) && isPlainObject(fromSource)) {
          // Merge objects at the same index
          const clone = cloneDeep(fromTarget) as Record<string, unknown>;

          mergedArray[index] = merge(clone, fromSource as Record<string, unknown>);
        } else {
          mergedArray[index] = cloneDeep(fromSource);
        }
      }

      targetObj[key] = mergedArray;
    } else if (isPlainObject(value) && isPlainObject(existing)) {
      merge(existing as Record<string, unknown>, value);
    } else {
      targetObj[key] = cloneDeep(value);
    }
  }

  return target as T & S;
};

export const groupBy = <TItem extends Record<string, unknown>, K extends keyof TItem & string>(
  items: TItem[],
  key: K
): Record<string, TItem[]> =>
  items.reduce<Record<string, TItem[]>>((accumulator, item) => {
    const groupKey = String(item[key]);

    if (!accumulator[groupKey]) {
      accumulator[groupKey] = [];
    }

    accumulator[groupKey].push(item);

    return accumulator;
  }, {});

export const pickBy = <T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> =>
  Object.entries(obj).reduce<Partial<T>>((accumulator, [key, value]) => {
    const typedKey = key as keyof T;
    const typedValue = value as T[keyof T];

    if (predicate(typedValue, typedKey)) {
      accumulator[typedKey] = typedValue;
    }

    return accumulator;
  }, {});

export const set = (obj: unknown, path: string, value: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  const result = obj as Record<string, unknown>;
  const segments = path.split(".");
  let current: Record<string, unknown> | unknown[] = result;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]!;
    const isLast = index === segments.length - 1;

    if (isLast) {
      (current as Record<string, unknown>)[segment] = value;
      break;
    }

    const nextSegment = segments[index + 1]!;
    const shouldBeArray = /^\d+$/.test(nextSegment);

    const currentTyped = current as Record<string, unknown>;

    if (currentTyped[segment] === undefined) {
      currentTyped[segment] = shouldBeArray ? [] : {};
    }

    current = currentTyped[segment] as Record<string, unknown> | unknown[];
  }

  return result;
};
