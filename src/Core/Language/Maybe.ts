/**
 * The Maybe type is an explicit container for the 'optional' concept.
 * A value is either a 'None' or a 'Some' value.
 * When you have a 'None', the value is missing.
 * When you have a 'Some', the value is present.
 */
export type Maybe<Value> = None | Some<Value>;

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

export const orNull = <Value>(maybe: Maybe<Value>): Value | null =>
  isNone(maybe) ? null : maybe.value;

export const orUndefined = <Value>(maybe: Maybe<Value>): Value | undefined =>
  isNone(maybe) ? undefined : maybe.value;

export const withFallback = <Value>(
  maybe: Maybe<Value>,
  fallback: Value,
): Value => (isNone(maybe) ? fallback : maybe.value);
