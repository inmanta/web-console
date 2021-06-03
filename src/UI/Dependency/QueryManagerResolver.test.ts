import { BaseApiHelper } from "@/Data";
import { getStoreInstance } from "@/UI/Store";
import { QueryManagerResolver } from "./QueryManagerResolver";

it("QueryManagerResolver should replace managers when environment changes", () => {
  const queryManagerResolver = new QueryManagerResolver(
    getStoreInstance(),
    new BaseApiHelper()
  );
  queryManagerResolver.resolve("env1");
  const originalLength = queryManagerResolver.get().length;
  queryManagerResolver.resolve("env2");
  expect(queryManagerResolver.get()).toHaveLength(originalLength);
});
