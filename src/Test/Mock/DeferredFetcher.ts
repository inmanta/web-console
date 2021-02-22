import { Either, Fetcher, Query } from "@/Core";

type Data<K extends Query.Kind> = Either.Type<string, Query.ApiResponse<K>>;

interface Handlers<K extends Query.Kind> {
  resolve: (value: Data<K> | PromiseLike<Data<K>>) => void;
}

export class DeferredFetcher<K extends Query.Kind = "Resources">
  implements Fetcher<K> {
  private handlers: Handlers<K> | null = null;

  getData(): Promise<Data<K>> {
    return new Promise((resolve) => {
      this.handlers = { resolve };
    });
  }

  resolve(data: Data<K>): void {
    if (this.handlers === null) return;
    this.handlers.resolve(data);
    this.handlers = null;
  }
}
