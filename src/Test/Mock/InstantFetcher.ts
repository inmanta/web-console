import { Either, Fetcher, ResourceModel } from "@/Core";

export type Outcome =
  | { kind: "Loading" }
  | { kind: "Failed"; error: string }
  | { kind: "Success"; resources: ResourceModel[] };

export class InstantFetcher implements Fetcher<"Resources"> {
  constructor(private readonly outcome: Outcome) {}

  getData(): Promise<Either.Type<string, ResourceModel[]>> {
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
          resolve(Either.right(outcome.resources));
        });
    }
  }
}
