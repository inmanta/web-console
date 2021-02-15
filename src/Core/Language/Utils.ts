export interface WithId {
  id: string;
}

export const getIsListEqual = <Data>(
  isEqual: (a: Data, b: Data) => boolean
) => (a: Data[], b: Data[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((element, index) => isEqual(element, b[index]));
};

export type Timer = ReturnType<typeof setInterval>;
