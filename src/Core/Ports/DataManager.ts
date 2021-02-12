import { Either, Maybe, RemoteData } from "@/Core/Language";
import { Query, QueryInfo } from "@/Core/Domain";

export interface DataManager {
  useSubscription(query: Query): void;
  useData(query: Query): QueryInfo[typeof query.kind]["data"];
}

export interface StateHelper<Error, Data> {
  set(id: string, value: RemoteData.Type<Error, Data>): void;
  get(id: string): RemoteData.Type<Error, Data>;
  getViaHook(id: string): RemoteData.Type<Error, Data>;
}

export type UpdateHandler<Error, Data> = (
  data: Either.Type<Error, Data>
) => void;

export type Timer = ReturnType<typeof setInterval>;

export interface Dictionary<Value> {
  get(key: string): Maybe.Type<Value>;
  set(key: string, value: Value): boolean;
  isFree(key: string): boolean;
  drop(key: string): void;
}

export interface ApiHelper<Subject, Error, Data> {
  getData(subject: Subject): Promise<Either.Type<Error, Data>>;
}

export interface HookHelper<Q = unknown, D = unknown> {
  useSubscription(query: Q): void;
  useData(query: Q): D;
  matches(query: Query): boolean;
}
