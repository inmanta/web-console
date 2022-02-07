import { EncodableParam } from "./EncodableParam";

test("Given parameter with slashes When used as a string Then returns the url encoded version", () => {
  const param = new EncodableParam("/tmp/dir/1");
  expect(`${param}`).toEqual("%2Ftmp%2Fdir%2F1");
  expect(param.toString()).toEqual("%2Ftmp%2Fdir%2F1");
  expect(`${new EncodableParam("")}`).toEqual("");
});
