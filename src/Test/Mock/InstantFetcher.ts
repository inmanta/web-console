import { Either, Fetcher, Query } from "@/Core";
import * as Outcome from "./Outcome";

export class InstantFetcher<K extends Query.Kind> implements Fetcher<K> {
  constructor(
    private outcome: Outcome.Type<Query.Error<K>, Query.ApiResponse<K>>
  ) {}

  getData(): Promise<Either.Type<Query.Error<K>, Query.ApiResponse<K>>> {
    return Outcome.handle<Query.Error<K>, Query.ApiResponse<K>>(this.outcome);
  }

  getRootData(): Promise<Either.Type<Query.Error<K>, Query.ApiResponse<K>>> {
    return Outcome.handle<Query.Error<K>, Query.ApiResponse<K>>(this.outcome);
  }
}
