export interface Setting {
  name: string;
  value: boolean;
  defaultValue: boolean;
}

export type InstanceConfig = Record<string, boolean>;
