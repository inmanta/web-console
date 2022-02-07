import { DeferredApiHelper } from "@/Test";
import { FileFetcherImpl } from "./FileFetcherImpl";

test("GIVEN FileFetcher WHEN executing get THEN the result is correctly returned", async () => {
  const apiHelper = new DeferredApiHelper();
  const fileFetcher = new FileFetcherImpl(apiHelper, "env");
  fileFetcher.get("id1").then((response) => {
    if (response.kind === "Left") {
      throw Error("Fetching file resulted in an error");
    }
    expect(response.value).toEqual("abcdefgh");
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v1/file/id1",
  });
  apiHelper.resolve({ content: "abcdefgh" });
});
