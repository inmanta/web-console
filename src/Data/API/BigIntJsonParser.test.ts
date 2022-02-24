import { BigIntJsonParser } from "./BigIntJsonParser";

test("GIVEN BigIntJsonParser WHEN parsing json with large integers THEN output does not lose precision", async () => {
  const parser = new BigIntJsonParser();
  const json = `{"foo": 9223372036854775807, "bar": {"num": 9223372036854775807, "reg": 123}}`;
  expect(parser.parse(json)).toEqual({
    foo: "9223372036854775807",
    bar: { num: "9223372036854775807", reg: 123 },
  });
});
