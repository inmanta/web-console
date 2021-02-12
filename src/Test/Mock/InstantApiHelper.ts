import { Either, ApiHelper, Query, ResourceModel } from "@/Core";

type Data = Either.Type<string, ResourceModel[]>;

export type Outcome =
  | { kind: "Loading" }
  | { kind: "Failed"; error: string }
  | { kind: "Success"; resources: ResourceModel[] };

export class InstantApiHelper
  implements ApiHelper<Query, string, ResourceModel[]> {
  constructor(private readonly outcome: Outcome) {}

  getData(): Promise<Data> {
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
