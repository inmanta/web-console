import { Resource } from "@/Test";
import { getUrl } from "./getUrl";

test("GIVEN getUrl WHEN provided with an id that contains special characters THEN the id is encoded", () => {
  expect(getUrl({ id: Resource.id })).toMatch(
    `/api/v2/resource/${Resource.encodedId}`
  );
});
