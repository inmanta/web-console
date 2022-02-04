import { BaseApiHelper } from "./BaseApiHelper";
import { FileFetcherImpl } from "./FileFetcherImpl";

test("GIVEN FileFetcher WHEN executing get THEN the result is correctly returned", async () => {
  const fileFetcher = new FileFetcherImpl(new BaseApiHelper(), "env");
  fetchMock.mockResponse(`{"content": "abcdefgh"}`);
  const response = await fileFetcher.get("id1");
  if (response.kind === "Left") {
    throw Error("Fetching file resulted in an error");
  }
  expect(response.value).toEqual("abcdefgh");
});
