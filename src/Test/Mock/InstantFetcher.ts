import { Either, Fetcher, Query } from "@/Core";

export type Outcome<K extends Query.Kind> =
  | { kind: "Loading" }
  | { kind: "Failed"; error: Query.Error<K> }
  | { kind: "Success"; data: Query.ApiResponse<K> };

export class InstantFetcher<K extends Query.Kind> implements Fetcher<K> {
  constructor(private outcome: Outcome<K>) {}

  getData(): Promise<Either.Type<Query.Error<K>, Query.ApiResponse<K>>> {
    const { outcome } = this;

    switch (outcome.kind) {
      case "Loading":
        return new Promise(() => {
          undefined;
        });

      case "Failed":
        return new Promise((resolve) => {
          resolve(Either.left(outcome.error));
        });

      case "Success":
        return new Promise((resolve) => {
          resolve(Either.right(outcome.data));
        });
    }
  }
}
