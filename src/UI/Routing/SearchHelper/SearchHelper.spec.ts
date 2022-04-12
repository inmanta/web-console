import { SearchHelper } from "./SearchHelper";

const helper = new SearchHelper();

test("GIVEN helper.keepEnvOnly WHEN search with env and other values THEN search with only env is returned", () => {
  expect(helper.keepEnvOnly("?abc=def&env=123")).toMatch("?env=123");
});

test("GIVEN a very long query string with more than 20 elements in an array WHEN parsing the query string THEN parses the array as an array, not an object", () => {
  let query = "?env=d2dbf117-14be-42c5-94e2-183f3e2fc51e";
  const expectedKeys: string[] = [];
  for (let i = 0; i < 25; i++) {
    const key = `val${i}`;
    query += `&state.ResourceDetails.logs-expansion[${i}]=${key}`;
    expectedKeys.push(key);
  }
  expect(
    (helper.parse(query).state as Record<string, Record<string, string>>)
      .ResourceDetails["logs-expansion"]
  ).toEqual(expectedKeys);
});
