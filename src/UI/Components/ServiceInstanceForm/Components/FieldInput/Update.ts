export type Update = (value: unknown) => void;
export type GetUpdate = (path: string) => Update;
