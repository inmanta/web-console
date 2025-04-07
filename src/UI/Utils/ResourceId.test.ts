import { getResourceIdFromResourceVersionId } from "./ResourceId";

test("Version is correctly left out of resource id", () => {
  expect(
    getResourceIdFromResourceVersionId(
      "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2",
    ),
  ).toEqual(
    "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f]",
  );
});
