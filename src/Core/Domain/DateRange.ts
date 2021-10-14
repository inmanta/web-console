import { isNotUndefined } from "@/Core/Language";

export enum Operator {
  From = "from",
  To = "to",
}

export interface DateRange {
  date: Date;
  operator: Operator;
}

export type Type = DateRange;

export const serialize = (range: DateRange): string =>
  `${range.operator}__${range.date.toISOString()}`;

export const serializeList = (ranges: DateRange[]): string[] =>
  ranges.map(serialize);

export const parse = (candidate: unknown): DateRange | undefined => {
  if (typeof candidate !== "string") return undefined;
  const [operator, dateString] = candidate.split("__");
  if (!isValidOperator(operator) || !isValidDate(dateString)) return undefined;
  return {
    operator,
    date: new Date(dateString),
  };
};

export const parseList = (candidate: unknown): DateRange[] | undefined => {
  if (!Array.isArray(candidate)) return undefined;
  return candidate.map(parse).filter(isNotUndefined);
};

const isValidOperator = (value: unknown): value is Operator =>
  typeof value === "string" && ["from", "to"].includes(value);

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && !isNaN(Date.parse(value));

export const serializeOperator = (operator: Operator): string => {
  switch (operator) {
    case Operator.From:
      return "ge";
    case Operator.To:
      return "le";
  }
};
