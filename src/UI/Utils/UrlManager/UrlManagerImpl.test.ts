import { dependencies, MockEditableFeatureManager } from "@/Test";
import { UrlManagerImpl } from "./index";

test("GIVEN UrlManagerImpl WHEN based on internal variables THEN getDocumentationLink() return proper adequate link to docs", () => {
  const featureManager = new MockEditableFeatureManager();
  const urlManagerOpenSource = new UrlManagerImpl(featureManager, "");
  const urlManagerStandard = new UrlManagerImpl(
    dependencies.featureManager,
    ""
  );

  expect(urlManagerOpenSource.getDocumentationLink()).not.toMatch(
    urlManagerStandard.getDocumentationLink()
  );
  expect(urlManagerStandard.getDocumentationLink()).toContain(
    dependencies.featureManager.getServerMajorVersion()
  );
  expect(urlManagerOpenSource.getDocumentationLink()).toContain(
    featureManager.getServerVersion()
  );
});
