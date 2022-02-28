import * as Either from "@/Core/Language/Either";

/**
 * The RemoteData type is a synchronous container for async data.
 *
 * There are 4 states:
 * - NotAsked means no data has been requested. This is usually the
 * initial state.
 *
 * - Loading means data has been requested, but not yet resolved.
 * This is the synchronous version of a pending promise.
 *
 * - Failed means the data request resulted in an error. Any reason
 * not resulting in valid data is contained in this Failed state.
 *
 * - Success means the data request resulted in actual valid data.
 */
export type RemoteData<F, S> = NotAsked | Loading | Failed<F> | Success<S>;

export type Type<F, S> = RemoteData<F, S>;

interface NotAsked {
  kind: "NotAsked";
}

export const notAsked = (): NotAsked => ({ kind: "NotAsked" });

export const isNotAsked = <F, S>(data: RemoteData<F, S>): data is NotAsked =>
  data.kind === "NotAsked";

interface Loading {
  kind: "Loading";
}

export const loading = (): Loading => ({ kind: "Loading" });

export const isLoading = <F, S>(data: RemoteData<F, S>): data is Loading =>
  data.kind === "Loading";

interface Failed<V> {
  kind: "Failed";
  value: V;
}

export const failed = <V>(value: V): Failed<V> => ({ kind: "Failed", value });

export const isFailed = <F, S>(data: RemoteData<F, S>): data is Failed<F> =>
  data.kind === "Failed";

interface Success<V> {
  kind: "Success";
  value: V;
}

export const success = <V>(value: V): Success<V> => ({
  kind: "Success",
  value,
});

export const isSuccess = <F, S>(data: RemoteData<F, S>): data is Success<S> =>
  data.kind === "Success";

export const mapSuccess = <F, S, N>(
  mapper: (s: S) => N,
  data: RemoteData<F, S>
): RemoteData<F, N> => {
  if (!isSuccess(data)) return data;
  return success(mapper(data.value));
};

export const fromEither = <L, R>(
  either: Either.Type<L, R>
): RemoteData<L, R> => {
  if (Either.isLeft(either)) {
    return failed(either.value);
  }
  return success(either.value);
};

export const fold = <F, S, R>(
  handlers: {
    notAsked: () => R;
    loading: () => R;
    failed: (value: F) => R;
    success: (value: S) => R;
  },
  data: RemoteData<F, S>
): R => {
  switch (data.kind) {
    case "NotAsked":
      return handlers.notAsked();
    case "Loading":
      return handlers.loading();
    case "Failed":
      return handlers.failed(data.value);
    case "Success":
      return handlers.success(data.value);
  }
};

/**
 * Merges 2 remote data values into 1.
 * When both values are successful, both values are returned.
 * In all other cases:
 * - Notasked takes priority over Loading.
 * - Loading takes priority over Failed.
 * - Failed takes priority over Success
 */
export const merge = <F1, S1, F2, S2>(
  data1: RemoteData<F1, S1>,
  data2: RemoteData<F2, S2>
): RemoteData<F1 | F2, [S1, S2]> => {
  if (isNotAsked(data1) || isNotAsked(data2)) return notAsked();
  if (isLoading(data1) || isLoading(data2)) return loading();
  if (isFailed(data1)) return failed(data1.value);
  if (isFailed(data2)) return failed(data2.value);
  return success([data1.value, data2.value] as [S1, S2]);
};

export const withFallback = <F, S>(data: RemoteData<F, S>, fallback: S): S =>
  isSuccess(data) ? data.value : fallback;
