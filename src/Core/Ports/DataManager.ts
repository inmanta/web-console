import { Either, Maybe, RemoteData } from "@/Core/Language";
import { Query, QueryResult } from "@/Core/Domain";

export interface DataManager {
  useSubscription(query: Query): void;
  useData(query: Query): QueryResult[typeof query.kind];
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
