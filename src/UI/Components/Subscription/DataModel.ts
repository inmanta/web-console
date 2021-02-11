export interface DataModel {
  id: string;
  value: number;
}

export const isEqual = (a: DataModel, b: DataModel): boolean =>
  a.id === b.id && a.value === b.value;

export interface Subject {
  kind: "Data";
  id: string;
}
