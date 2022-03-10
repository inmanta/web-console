import { ApiHelper, Either, ErrorWithHTTPCode, Maybe } from "@/Core";
import * as Outcome from "./Outcome";

export class InstantApiHelper<Data> implements ApiHelper {
  constructor(private outcome: Outcome.Type<string, Data>) {}

  get<Data>(): Promise<Either.Type<string, Data>> {
    return Outcome.handle<string, Data>(
      this.outcome as Outcome.Type<string, Data>
    );
  }

  getWithHTTPCode<Data>(): Promise<Either.Type<ErrorWithHTTPCode, Data>> {
    throw new Error("Method not implemented.");
  }

  getWithoutEnvironment<Data>(): Promise<Either.Type<string, Data>> {
    return Outcome.handle<string, Data>(
      this.outcome as Outcome.Type<string, Data>
    );
  }
  post<Data>(): Promise<Either.Type<string, Data>> {
    throw new Error("Method not implemented.");
  }
  postWithoutResponse(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  postWithoutResponseAndEnvironment(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  putWithoutResponseAndEnvironment(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  patch(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  delete(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  head(): Promise<number> {
    throw new Error("Method not implemented.");
  }
}
