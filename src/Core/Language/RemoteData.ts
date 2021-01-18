import { Either } from ".";

type RemoteData<F, S> = NotAsked | Loading | Failed<F> | Success<S>;

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

export const mapSuccess = <F, S, N>(mapper: (s: S) => N) => (
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

export const fold = <F, S, R>(handlers: {
  notAsked: () => R;
  loading: () => R;
  failed: (value: F) => R;
  success: (value: S) => R;
}) => (data: RemoteData<F, S>): R => {
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
