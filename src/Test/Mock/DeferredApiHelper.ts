import { ApiHelper, Either, Maybe } from "@/Core";

type Request =
  | (WithMethod<"GET"> & UrlAndEnv)
  | (WithMethod<"POST"> & UrlAndEnv & WithBody)
  | (WithMethod<"PATCH"> & UrlAndEnv & WithBody)
  | (WithMethod<"DELETE"> & UrlAndEnv);

interface WithMethod<Method extends string> {
  method: Method;
}

interface UrlAndEnv {
  url: string;
  environment: string;
}

interface WithBody {
  body: unknown;
}

interface PendingRequest {
  request: Request;
  resolve: (value: unknown | PromiseLike<unknown>) => void;
  promise: Promise<unknown>;
}

export class DeferredApiHelper implements ApiHelper {
  private readonly pendingRequests: PendingRequest[] = [];
  private readonly resolvedRequests: Request[] = [];

  resolve(data: unknown): Promise<unknown> {
    if (this.pendingRequests.length <= 0) {
      throw new Error("No available invocations");
    }
    if (this.pendingRequests.length >= 2) {
      throw new Error("2 or more invocations");
    }
    const { resolve, promise, request } = this.pendingRequests[0];
    this.resolvedRequests.push(request);
    this.pendingRequests.pop();
    resolve(data);
    return promise;
  }

  getBaseUrl(): string {
    return "";
  }

  delete(url: string, environment: string): Promise<Maybe.Type<string>> {
    const promise = new Promise((resolve) => {
      this.pendingRequests.push({
        request: { method: "DELETE", url, environment },
        resolve,
        promise,
      });
    });

    return promise as Promise<Maybe.Type<string>>;
  }

  get<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, Data>> {
    const promise = new Promise((resolve) => {
      this.pendingRequests.push({
        request: { method: "GET", url, environment },
        resolve,
        promise,
      });
    });

    return promise as Promise<Either.Type<string, Data>>;
  }

  post<Data, Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, Data>> {
    const promise = new Promise((resolve) => {
      this.pendingRequests.push({
        request: { method: "POST", url, environment, body },
        resolve,
        promise,
      });
    });

    return promise as Promise<Either.Type<string, Data>>;
  }

  postWithoutResponse<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    const promise = new Promise((resolve) => {
      this.pendingRequests.push({
        request: { method: "POST", url, environment, body },
        resolve,
        promise,
      });
    });

    return promise as Promise<Maybe.Type<string>>;
  }

  patch<Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    const promise = new Promise((resolve) => {
      this.pendingRequests.push({
        request: { method: "PATCH", url, environment, body },
        resolve,
        promise,
      });
    });

    return promise as Promise<Maybe.Type<string>>;
  }
}
