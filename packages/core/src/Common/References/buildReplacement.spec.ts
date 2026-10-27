import { buildReplacement } from "./buildReplacement";

describe("buildReplacement", () => {
  // Conformance to the emitted-subset spec: the destination table in the References
  // epic (#7354). Each row is a destination the exporter can emit and what the
  // console must derive from it - the attribute it targets and whether it is the
  // whole attribute. The path is only classified, never resolved.
  test.each<{ label: string; destination: string; attributeKey: string; whole: boolean }>([
    { label: "whole attribute", destination: "value", attributeKey: "value", whole: true },
    {
      label: "nested quoted key",
      destination: "yang_credentials.'password'",
      attributeKey: "yang_credentials",
      whole: false,
    },
    {
      label: "quoted key with spaces plus an index",
      destination: "config.'listen address'[0]",
      attributeKey: "config",
      whole: false,
    },
    {
      label: "mjson argument key ($ root, one level down)",
      destination: "$[0]",
      attributeKey: "$",
      whole: false,
    },
    {
      label: "legacy leading-dot dictpath (core tolerates it)",
      destination: ".value",
      attributeKey: "value",
      whole: true,
    },
    {
      // Valid jsonpath but never emitted, and it does not denote one location. It
      // stays harmless: the destination is kept for raw display, and "$" matches no
      // real attribute, so it is never grouped as a located value.
      label: "non-emitted multi-location path",
      destination: "$.foo[*].bar",
      attributeKey: "$",
      whole: false,
    },
  ])("classifies $label", ({ destination, attributeKey, whole }) => {
    expect(buildReplacement(destination, "ref-1")).toEqual({
      destination,
      attributeKey,
      isWholeAttribute: whole,
      referenceId: "ref-1",
    });
  });

  // Extra coverage of the first-segment reader beyond the table rows. Only the first
  // segment is read, so anything after it (a quoted key, an escaped quote, even a
  // malformed segment) does not affect the attribute or the whole-vs-nested answer.
  test.each<{ label: string; destination: string; attributeKey: string; whole: boolean }>([
    {
      label: "a later segment with an escaped quote (ignored)",
      destination: "creds.'it\\'s'",
      attributeKey: "creds",
      whole: false,
    },
    {
      label: "a malformed later segment (ignored)",
      destination: "a.'b",
      attributeKey: "a",
      whole: false,
    },
    { label: "a top-level index", destination: "[0]", attributeKey: "[0]", whole: true },
  ])("classifies $label", ({ destination, attributeKey, whole }) => {
    expect(buildReplacement(destination, "ref-1")).toEqual({
      destination,
      attributeKey,
      isWholeAttribute: whole,
      referenceId: "ref-1",
    });
  });

  // An unparseable first segment degrades to the raw destination, so the row still
  // renders as text instead of vanishing. A quoted first key (never emitted - the
  // first segment is always a field name or `$`) falls here too.
  test.each<{ label: string; destination: string }>([
    { label: "an empty string", destination: "" },
    { label: "a bare leading dot", destination: "." },
    { label: "a quoted first key (never emitted)", destination: ".'key.with.dot'" },
    { label: "a non-integer top-level index", destination: "[x]" },
  ])("degrades $label to a raw-keyed replacement", ({ destination }) => {
    expect(buildReplacement(destination, "ref-1")).toEqual({
      destination,
      attributeKey: destination,
      isWholeAttribute: false,
      referenceId: "ref-1",
    });
  });
});
