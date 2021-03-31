export interface Setting {
  name: string;
  value: boolean;
  defaultValue: boolean;
}

export type Config = Record<string, boolean>;
