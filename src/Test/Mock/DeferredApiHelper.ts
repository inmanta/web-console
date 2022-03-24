import { isEqual, remove } from "lodash-es";
import { ApiHelper, Deferred, Either, ErrorWithHTTPCode, Maybe } from "@/Core";

type Request =
  | (WithMethod<"GET"> & UrlAndEnv)
  | (WithMethod<"POST"> & UrlAndEnv & WithBody)
  | (WithMethod<"PATCH"> & UrlAndEnv & WithBody)
  | (WithMethod<"PUT"> & UrlAndEnv & WithBody)
  | (WithMethod<"HEAD"> & UrlAndEnv)
  | (WithMethod<"DELETE"> & UrlAndEnv);

interface WithMethod<Method extends string> {
  method: Method;
}

interface UrlAndEnv {
  url: string;
  environment?: string;
}

interface WithBody {
  body: unknown;
}

interface PendingRequest {
  request: Request;
  resolve: (value: unknown | PromiseLike<unknown>) => void;
  promise: Promise<unknown>;
}

type ResolvedRequest = { data: unknown } & Request;

export class DeferredApiHelper implements ApiHelper {
  private readonly _pendingRequests: PendingRequest[] = [];
  readonly resolvedRequests: ResolvedRequest[] = [];

  get pendingRequests(): Request[] {
    return this._pendingRequests.map((p) => p.request);
  }

  private resolvePendingRequest(
    { resolve, promise, request }: PendingRequest,
    data: unknown
  ): Promise<unknown> {
    this.resolvedRequests.push({ ...request, data });
    resolve(data);
    return promise;
  }

  /**
   * Resolves the first pending request
   */
  resolve(data: unknown): Promise<unknown> {
    const pendingRequest = this._pendingRequests.shift();
    if (typeof pendingRequest === "undefined") {
      throw new Error("No available invocations");
    }

    return this.resolvePendingRequest(pendingRequest, data);
  }

  private extractPendingRequest(request: Request): PendingRequest | undefined {
    return remove(this._pendingRequests, (req) =>
      isEqual(req.request, request)
    )[0];
  }

  /**
   * Resolves the first pending request that matches the subject
   */
  resolveRequest(subject: Request, data: unknown): Promise<unknown> {
    const pendingRequest = this.extractPendingRequest(subject);
    if (typeof pendingRequest === "undefined") {
      throw new Error("No matching request found");
    }
    return this.resolvePendingRequest(pendingRequest, data);
  }

  /**
   * Removes first pending request
   */
  ignore(): void {
    this._pendingRequests.shift();
  }

  /**
   * Removes first pending request that matches the subject
   */
  ignoreRequest(subject: Request): void {
    this.extractPendingRequest(subject);
  }

  delete(url: string, environment: string): Promise<Maybe.Type<string>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "DELETE", url, environment },
      resolve,
      promise,
    });
    return promise as Promise<Maybe.Type<string>>;
  }

  get<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<string, Data>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "GET", url, environment },
      resolve,
      promise,
    });

    return promise as Promise<Either.Type<string, Data>>;
  }

  getWithHTTPCode<Data>(
    url: string,
    environment: string
  ): Promise<Either.Type<ErrorWithHTTPCode, Data>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "GET", url, environment },
      resolve,
      promise,
    });

    return promise as Promise<Either.Type<ErrorWithHTTPCode, Data>>;
  }

  getWithoutEnvironment<Data>(url: string): Promise<Either.Type<string, Data>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "GET", url },
      resolve,
      promise,
    });
    return promise as Promise<Either.Type<string, Data>>;
  }

  post<Data, Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Either.Type<string, Data>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "POST", url, environment, body },
      resolve,
      promise,
    });
    return promise as Promise<Either.Type<string, Data>>;
  }

  postWithoutResponse<Body>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "POST", url, environment, body },
      resolve,
      promise,
    });
    return promise as Promise<Maybe.Type<string>>;
  }

  postWithoutResponseAndEnvironment<Body>(
    url: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "POST", url, body },
      resolve,
      promise,
    });
    return promise as Promise<Maybe.Type<string>>;
  }

  putWithoutEnvironment<Data, Body>(
    url: string,
    body: Body
  ): Promise<Either.Type<string, Data>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "PUT", url, body },
      resolve,
      promise,
    });
    return promise as Promise<Either.Type<string, Data>>;
  }

  patch<Body = unknown>(
    url: string,
    environment: string,
    body: Body
  ): Promise<Maybe.Type<string>> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "PATCH", url, environment, body },
      resolve,
      promise,
    });
    return promise as Promise<Maybe.Type<string>>;
  }

  head(url: string): Promise<number> {
    const { promise, resolve } = new Deferred();
    this._pendingRequests.push({
      request: { method: "HEAD", url },
      resolve,
      promise,
    });

    return promise as Promise<number>;
  }
}
