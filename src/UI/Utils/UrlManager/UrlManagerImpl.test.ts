import { PrimaryFeatureManager } from "@/Data";
import { UrlManagerImpl } from "./UrlManagerImpl";

const featureManager = new PrimaryFeatureManager();

test("Model version href creator works correctly", () => {
  expect(
    new UrlManagerImpl(featureManager, "", "env1").getModelVersionUrl("4")
  ).toEqual("/dashboard/#!/environment/env1/version/4");
});

test("Versioned Resource href creator works correctly", () => {
  expect(
    new UrlManagerImpl(featureManager, "", "env1").getVersionedResourceUrl(
      "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f]",
      "2"
    )
  ).toEqual(
    "/dashboard/#!/environment/env1/version/2/unittest::Resource%5Binternal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f%5D"
  );
});
