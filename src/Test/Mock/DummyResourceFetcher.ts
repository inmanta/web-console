import { Either, ResourceFetcher, ResourceModel } from "@/Core";
import { Resource } from "@/Test";

type Resolve = "Loading" | "Failed" | "Empty" | "Success";

export class DummyResourceFetcher implements ResourceFetcher {
  constructor(private readonly resolve: Resolve) {}

  getResources(): Promise<Either.Type<string, ResourceModel[]>> {
    switch (this.resolve) {
      case "Loading":
        return new Promise(() => {
          undefined;
        });

      case "Failed":
        return new Promise((resolve) => {
          resolve(Either.left("error"));
        });

      case "Empty":
        return new Promise((resolve) => {
          resolve(Either.right([]));
        });

      case "Success":
        return new Promise((resolve) => {
          resolve(Either.right(Resource.resources));
        });
    }
  }
}
