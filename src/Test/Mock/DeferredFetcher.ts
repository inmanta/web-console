import { Either, Fetcher, Query } from "@/Core";

type Data<K extends Query.Kind> = Either.Type<string, Query.ApiResponse<K>>;

interface Handlers<K extends Query.Kind> {
  resolve: (value: Data<K> | PromiseLike<Data<K>>) => void;
  promise: Promise<Data<K>>;
}

export class DeferredFetcher<K extends Query.Kind> implements Fetcher<K> {
  private handlers: Handlers<K> | null = null;
  private invocations: Query.SubQuery<K>[] = [];

  getData(query: Query.SubQuery<K>): Promise<Data<K>> {
    this.invocations.push(query);
    const promise: Promise<Data<K>> = new Promise((resolve) => {
      this.handlers = { resolve, promise };
    });
    return promise;
  }

  resolve(data: Data<K>): Promise<Data<K>> {
    if (this.handlers === null) throw new Error("No available handlers");
    const { resolve, promise } = this.handlers;
    this.handlers = null;
    resolve(data);
    return promise;
  }

  getInvocations(): Query.SubQuery<K>[] {
    return this.invocations;
  }
}
