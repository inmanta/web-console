import { Either, ApiHelper } from "@/Core";
import { DataModel, Subject } from "../DataModel";

type Data = Either.Type<string, DataModel>;

interface Handlers {
  resolve: (value: Data | PromiseLike<Data>) => void;
}

export class DummyApiHelper implements ApiHelper<Subject, string, DataModel> {
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
