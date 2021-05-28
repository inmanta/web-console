import { BaseApiHelper } from "@/Infra";
import { getStoreInstance } from "../Store";
import { QueryManagerResolver } from "./QueryManagerResolver";

it("QueryManagerResolver should replace managers when environment changes", () => {
  const queryManagerResolver = new QueryManagerResolver(
    getStoreInstance(),
    new BaseApiHelper(),
    "UTC"
  );
  queryManagerResolver.resolve("env1");
  const originalLength = queryManagerResolver.get().length;
  queryManagerResolver.resolve("env2");
  expect(queryManagerResolver.get()).toHaveLength(originalLength);
});
