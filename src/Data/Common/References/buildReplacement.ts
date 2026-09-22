import { Reference } from "@/Core/Domain";

// Destinations (and mjson keys) are jsonpath, but the console only reads the first
// segment: the attribute a replacement targets and whether it is the whole attribute.
// So it parses that narrow emitted subset rather than taking a jsonpath dependency.
// Emitted-subset spec: References epic #7354.

const isIdentChar = (char: string): boolean => /[A-Za-z0-9_]/.test(char);

/**
 * The first path segment: the attribute a destination targets (`key`) and whether it
 * is the whole attribute (`whole`). The segment is a field name, `$`, or `[<int>]`,
 * optionally after a legacy leading dot; `undefined` when unparseable.
 *
 * @example firstSegment("config.'listen address'[0]") // => { key: "config", whole: false }
 * @example firstSegment("value")                       // => { key: "value", whole: true }
 */
const firstSegment = (path: string): { key: string; whole: boolean } | undefined => {
  if (path.length === 0) {
    return undefined;
  }

  let i = 0;
  let key: string;

  if (path[0] === "$") {
    key = "$";
    i = 1;
  } else if (path[0] === "[") {
    const end = path.indexOf("]");

    if (end < 2 || !/^[0-9]+$/.test(path.slice(1, end))) {
      return undefined; // non-integer index (e.g. `[*]`) or missing `]`
    }
    key = path.slice(0, end + 1);
    i = end + 1;
  } else {
    if (path[0] === ".") {
      i = 1; // legacy leading dot
    }
    const start = i;

    while (i < path.length && isIdentChar(path[i])) {
      i++;
    }
    if (i === start) {
      return undefined;
    }
    key = path.slice(start, i);
  }

  return { key, whole: i >= path.length };
};

/**
 * Turns a mutator destination and the reference that fills it into a {@link
 * Reference.Replacement}. An unparseable destination keeps the raw string as its
 * `attributeKey`: a ReplacementList still prints it verbatim, while top-level
 * attribute grouping only places a key that matches an attribute.
 *
 * @example buildReplacement("value", "b5d776d4-...")
 *   => { destination: "value", attributeKey: "value", isWholeAttribute: true, referenceId: "b5d776d4-..." }
 */
export const buildReplacement = (
  destination: string,
  referenceId: string
): Reference.Replacement => {
  const first = firstSegment(destination);

  if (first === undefined) {
    return { destination, attributeKey: destination, isWholeAttribute: false, referenceId };
  }

  return {
    destination,
    attributeKey: first.key,
    isWholeAttribute: first.whole,
    referenceId,
  };
};
