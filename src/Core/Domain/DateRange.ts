import { isNotUndefined } from "@/Core/Language";
import { isValidOperator, Operator } from "./RangeOperator";

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

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && !isNaN(Date.parse(value));
