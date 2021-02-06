type Maybe<Value> = None | Some<Value>;

export type Type<Value> = Maybe<Value>;

interface None {
  kind: "None";
}

export const none = (): None => ({ kind: "None" });

export const isNone = <Value>(maybe: Maybe<Value>): maybe is None =>
  maybe.kind === "None";

interface Some<Value> {
  kind: "Some";
  value: Value;
}

export const some = <Value>(value: Value): Some<Value> => ({
  kind: "Some",
  value,
});

export const isSome = <Value>(maybe: Maybe<Value>): maybe is Some<Value> =>
  maybe.kind === "Some";
