import { Query, RemoteData } from "@/Core";

export type GetDependencies<
  Kind extends Query.Kind,
  WithEnv extends boolean
> = WithEnv extends true
  ? (
      query: Query.SubQuery<Kind>,
      environment: string
    ) => (string | number | boolean | undefined)[]
  : (query: Query.SubQuery<Kind>) => (string | number | boolean | undefined)[];

export type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export type GetUnique<Kind extends Query.Kind, WithEnv> = WithEnv extends true
  ? (query: Query.SubQuery<Kind>, environment: string) => string
  : (query: Query.SubQuery<Kind>) => string;
