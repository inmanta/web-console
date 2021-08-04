type Value = 5 | 10 | 20 | 50 | 100;

interface PageSize {
  kind: "PageSize";
  value: Value;
}

export type Type = PageSize;

const listOfValues = [5, 10, 20, 50, 100];

const valueIsValid = (value: number): value is Value =>
  listOfValues.includes(value);

export const from = (value: number): PageSize => {
  if (!valueIsValid(value)) return { kind: "PageSize", value: 20 };
  return { kind: "PageSize", value };
};

export const list = [5, 10, 20, 50, 100].map(from);

export const initial = from(20);

export const equals = (a: PageSize, b: PageSize): boolean =>
  a.value === b.value;
