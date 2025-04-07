import { Either } from "@/Core";
import { DeferredApiHelper } from "@/Test";
import { FileFetcherImpl } from "./FileFetcherImpl";

test("GIVEN FileFetcher WHEN executing get THEN the result is correctly returned", async () => {
  const apiHelper = new DeferredApiHelper();
  const fileFetcher = new FileFetcherImpl(apiHelper, "env");
  const fetchResult = fileFetcher.get("id1");

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v1/file/id1",
  });
  apiHelper.resolve(Either.right({ content: window.btoa("abcdefgh") }));
  await expect(fetchResult).resolves.toEqual(Either.right("abcdefgh"));
});
