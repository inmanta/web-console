export interface WithId {
  id: string;
}

export const getIsListEqual = <Data>(
  isEqual: (a: Data, b: Data) => boolean
) => (a: Data[], b: Data[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((element, index) => isEqual(element, b[index]));
};

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
