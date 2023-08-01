import { parseNumberWithType } from "./parseNumberWithType";

test.each`
  value                    | type       | parsedValue
  ${"5"}                   | ${"int"}   | ${5}
  ${"5"}                   | ${"float"} | ${5}
  ${"5oooo"}               | ${"int"}   | ${"5oooo"}
  ${"5oooo"}               | ${"float"} | ${"5oooo"}
  ${"9223372036854775807"} | ${"int"}   | ${9223372036854775807n}
  ${"9223372036854775807"} | ${"float"} | ${9223372036854775807n}
  ${"50"}                  | ${"int?"}  | ${50}
  ${"1.2"}                 | ${"float"} | ${1.2}
  ${"1234.1234"}           | ${"float"} | ${1234.1234}
`(
  "GIVEN parseNumberWithType WHEN value ($value) and type ($type) THEN returns $parsedValue",
  ({ value, type, parsedValue }) => {
    expect(parseNumberWithType(type, value)).toEqual(parsedValue);
  },
);
