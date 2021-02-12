import { Either, ApiHelper, Query, ResourceModel } from "@/Core";

type Data = Either.Type<string, ResourceModel[]>;

interface Handlers {
  resolve: (value: Data | PromiseLike<Data>) => void;
}

export class DeferredApiHelper implements ApiHelper<Query> {
  private handlers: Handlers | null = null;

  getData(): Promise<Data> {
    return new Promise((resolve) => {
      this.handlers = { resolve };
    });
  }

  resolve(data: Data): void {
    if (this.handlers === null) return;
    this.handlers.resolve(data);
    this.handlers = null;
  }
}
