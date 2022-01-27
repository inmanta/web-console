import { NativeJsonParser } from "./NativeJsonParser";

test("GIVEN NativeJsonParser WHEN parsing json with large integers THEN output loses precision", async () => {
  const parser = new NativeJsonParser();
  const json = `{"foo": 9223372036854775807, "bar": {"num": 9223372036854775807, "reg": 123}}`;
  expect(parser.parse(json).foo).not.toEqual("9223372036854775807");
  expect(parser.parse(json).bar.reg).toEqual(123);
});
