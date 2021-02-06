import { Either, Maybe, RemoteData } from "@/Core";

export interface DataModel {
  id: string;
  value: number;
}

export type Timer = ReturnType<typeof setInterval>;

export interface StateHelper {
  set(id: string, value: Either.Type<string, DataModel>): void;
  get(id: string): RemoteData.Type<string, DataModel>;
}

export interface ApiHelper {
  getData(id: string): Promise<Either.Type<string, DataModel>>;
}

export type UpdateHandler = (data: Either.Type<string, DataModel>) => void;

export interface SubscriptionHelper {
  subscribeTo(subject: Subject, updateHandler: UpdateHandler): void;
  unsubscribeFrom(subject: Subject): void;
}

export type Subject = { kind: "Data"; id: string };

export interface HookedDataManager {
  useSubscription(subject: Subject): void;
  useData(subject: Subject): RemoteData.Type<string, DataModel>;
}

export interface Dictionary<Value> {
  get(key: string): Maybe.Type<Value>;
  set(key: string, value: Value): boolean;
  isFree(key: string): boolean;
  drop(key: string): void;
}
