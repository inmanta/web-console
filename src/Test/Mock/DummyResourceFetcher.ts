import { Either, ResourceFetcher, ResourceModel } from "@/Core";

type Outcome =
  | { kind: "Loading" }
  | { kind: "Failed"; error: string }
  | { kind: "Success"; resources: ResourceModel[] };

export class DummyResourceFetcher implements ResourceFetcher {
  constructor(private readonly outcome: Outcome) {}

  getResources(): Promise<Either.Type<string, ResourceModel[]>> {
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
