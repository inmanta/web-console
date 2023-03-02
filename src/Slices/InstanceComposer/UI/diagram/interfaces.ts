interface ColumnData {
  name: string;
  [key: string]: string;
}
interface FormInput {
  [key: string]: {
    label: string;
    type: string;
    value: string;
    [key: string]: string;
  };
}
interface RouterOptions {
  padding?: number;
  sourcePadding?: number;
  targetPadding?: number;
}

export { ColumnData, RouterOptions, FormInput };
