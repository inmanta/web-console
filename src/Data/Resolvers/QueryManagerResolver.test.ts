import { BaseApiHelper, getStoreInstance } from "@/Data";
import { QueryManagerResolver } from "./QueryManagerResolver";

it("QueryManagerResolver should replace managers when environment changes", () => {
  const queryManagerResolver = new QueryManagerResolver(
    getStoreInstance(),
    new BaseApiHelper()
  );
  queryManagerResolver.resolve();
  const originalLength = queryManagerResolver.get().length;
  queryManagerResolver.resolve();
  expect(queryManagerResolver.get()).toHaveLength(originalLength);
});
