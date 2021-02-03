import { Either, ResourceFetcher } from "@/Core";
import { Resource } from "@/Test";

type Resolve = "Loading" | "Failed" | "Success";

export class DummyResourceFetcher implements ResourceFetcher {
  constructor(private readonly resolve: Resolve) {}

  getResources(): Promise<Either.Type<string, unknown>> {
    switch (this.resolve) {
      case "Loading":
        return new Promise(() => {
          undefined;
        });
      case "Failed":
        return new Promise((resolve) => {
          resolve(Either.left("error"));
        });

      case "Success":
        return new Promise((resolve) => {
          resolve(Either.right(Resource.resources));
        });
    }
  }
}
