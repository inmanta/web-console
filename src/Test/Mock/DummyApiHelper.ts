import { Either } from "@/Core";
import { Type } from "@/Core/Language/Either";
import { ApiHelper, DataModel } from "@/UI/Components/Subscription/Interfaces";

interface Handlers<T> {
  resolve: (value: T | PromiseLike<T>) => void;
}

export class DummyApiHelper implements ApiHelper {
  private handlers: Handlers<Either.Type<string, DataModel>> | null = null;

  getData(): Promise<Type<string, DataModel>> {
    return new Promise((resolve) => {
      this.handlers = { resolve };
    });
  }

  resolve(data: Either.Type<string, DataModel>): void {
    if (this.handlers === null) return;
    this.handlers.resolve(data);
    this.handlers = null;
  }
}
