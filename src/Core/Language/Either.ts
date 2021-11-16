type Either<L, R> = Left<L> | Right<R>;

export type Type<L, R> = Either<L, R>;

interface Left<V> {
  kind: "Left";
  value: V;
}

export const left = <V>(value: V): Left<V> => ({ kind: "Left", value });

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
  either.kind === "Left";

interface Right<V> {
  kind: "Right";
  value: V;
}

export const right = <V>(value: V): Right<V> => ({ kind: "Right", value });

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> =>
  either.kind === "Right";

export const mapRight = <L, R, NR>(
  mapper: (value: R) => NR,
  either: Either<L, R>
): Either<L, NR> => {
  if (isLeft(either)) return either;
  return right(mapper(either.value));
};
