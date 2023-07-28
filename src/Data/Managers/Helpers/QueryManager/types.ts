import { Query, RemoteData } from "@/Core";

export type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void,
];

type GetDependenciesWith<
  Kind extends Query.Kind,
  WithEnv,
> = WithEnv extends true
  ? (
      query: Query.SubQuery<Kind>,
      environment: string,
    ) => (string | number | boolean | undefined)[]
  : (query: Query.SubQuery<Kind>) => (string | number | boolean | undefined)[];

export type GetDependencies<Kind extends Query.Kind> = GetDependenciesWith<
  Kind,
  false
>;
export type GetDependenciesWithEnv<Kind extends Query.Kind> =
  GetDependenciesWith<Kind, true>;

type GetUniqueWith<Kind extends Query.Kind, WithEnv> = WithEnv extends true
  ? (query: Query.SubQuery<Kind>, environment: string) => string
  : (query: Query.SubQuery<Kind>) => string;

export type GetUnique<Kind extends Query.Kind> = GetUniqueWith<Kind, false>;
export type GetUniqueWithEnv<Kind extends Query.Kind> = GetUniqueWith<
  Kind,
  true
>;

export type GetUrl<Kind extends Query.Kind> = GetUniqueWith<Kind, false>;
export type GetUrlWithEnv<Kind extends Query.Kind> = GetUniqueWith<Kind, true>;

export type ToUsed<Kind extends Query.Kind> = (
  data: Query.Data<Kind>,
  setUrl: (url: string) => void,
) => Query.UsedData<Kind>;

export type ReadOnlyToUsed<Kind extends Query.Kind> = (
  data: Query.Data<Kind>,
) => Query.UsedData<Kind>;
