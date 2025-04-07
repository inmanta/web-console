import { isNotUndefined, ParsedNumber } from '@/Core/Language';
import { isValidOperator, Operator } from './RangeOperator';

export interface IntRange {
  value: ParsedNumber;
  operator: Operator;
}

export type Type = IntRange;

const serialize = (range: IntRange): string =>
  `${range.operator}__${range.value}`;

export const serializeList = (ranges: IntRange[]): string[] =>
  ranges.map(serialize);

const parse = (candidate: unknown): IntRange | undefined => {
  if (typeof candidate !== 'string') return undefined;
  const [operator, valueString] = candidate.split('__');

  if (!isValidOperator(operator) || !isValidNumber(valueString))
    return undefined;

  return {
    operator,
    value: parseInt(valueString, 10),
  };
};

export const parseList = (candidate: unknown): IntRange[] | undefined => {
  if (!Array.isArray(candidate)) return undefined;

  return candidate.map(parse).filter(isNotUndefined);
};

const isValidNumber = (value: unknown): value is number =>
  typeof value === 'string' && !isNaN(parseInt(value, 10));
