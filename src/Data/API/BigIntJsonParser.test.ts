import { BigIntJsonParser } from "./BigIntJsonParser";

test("GIVEN BigIntJsonParser WHEN parsing json with large integers THEN integers are converted to bigints", async () => {
  const parser = new BigIntJsonParser();
  const json = `{"foo": 9223372036854775807, "bar": {"num": 9223372036854775807, "small": 123, "float": 0.123}}`;
  expect(parser.parse(json)).toEqual({
    foo: 9223372036854775807n,
    bar: { num: 9223372036854775807n, small: 123, float: 0.123 },
  });
});

test("GIVEN BigIntJsonParser WHEN parsing json with large integers THEN integers are converted to bigints", async () => {
  const parser = new BigIntJsonParser();
  const obj = {
    foo: 9223372036854775807n,
    bar: { num: 9223372036854775807n, small: 123, float: 0.123 },
  };
  expect(parser.stringify(obj)).toEqual(
    `{"foo":9223372036854775807,"bar":{"num":9223372036854775807,"small":123,"float":0.123}}`,
  );
});
