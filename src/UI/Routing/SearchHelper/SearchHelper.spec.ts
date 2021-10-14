import { SearchHelper } from "./SearchHelper";

const helper = new SearchHelper();

test("GIVEN helper.keepEnvOnly WHEN search with env and other values THEN search with only env is returned", () => {
  expect(helper.keepEnvOnly("?abc=def&env=123")).toMatch("?env=123");
});
