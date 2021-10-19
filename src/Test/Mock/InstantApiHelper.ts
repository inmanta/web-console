import { ApiHelper, Either, Maybe } from "@/Core";
import * as Outcome from "./Outcome";

export class InstantApiHelper<Data> implements ApiHelper {
  constructor(private outcome: Outcome.Type<string, Data>) {}

  get<Data>(): Promise<Either.Type<string, Data>> {
    return Outcome.handle<string, Data>(
      this.outcome as Outcome.Type<string, Data>
    );
  }
  getWithoutEnvironment<Data>(): Promise<Either.Type<string, Data>> {
    throw new Error("Method not implemented.");
  }
  post<Data>(): Promise<Either.Type<string, Data>> {
    throw new Error("Method not implemented.");
  }
  postWithoutResponse(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  patch(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  delete(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
}
